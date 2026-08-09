import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

export const listCustomers = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(parseInt(String(req.query.page || "1"), 10), 1);
  const limit = Math.min(Math.max(parseInt(String(req.query.limit || "10"), 10), 1), 100);
  const search = String(req.query.search || "").trim();
  const status = req.query.status ? String(req.query.status) : undefined;
  const customerType = req.query.customerType ? String(req.query.customerType) : undefined;

  const where: Prisma.CustomerWhereInput = {
    AND: [
      search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { mobile: { contains: search, mode: "insensitive" } },
              { businessName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
      status ? { status: status as any } : {},
      customerType ? { customerType: customerType as any } : {},
    ],
  };

  const [items, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.customer.count({ where }),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

export const getCustomer = asyncHandler(async (req: Request, res: Response) => {
  const customer = await prisma.customer.findUnique({
    where: { id: req.params.id },
    include: {
      followUps: { orderBy: { createdAt: "desc" }, include: { createdBy: { select: { name: true } } } },
      challans: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!customer) throw ApiError.notFound("Customer not found");
  res.json({ success: true, data: customer });
});

export const createCustomer = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body;
  const customer = await prisma.customer.create({
    data: {
      ...body,
      email: body.email || null,
      followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
      createdById: req.user!.sub,
    },
  });
  res.status(201).json({ success: true, data: customer });
});

export const updateCustomer = asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.customer.findUnique({ where: { id: req.params.id } });
  if (!existing) throw ApiError.notFound("Customer not found");

  const body = req.body;
  const customer = await prisma.customer.update({
    where: { id: req.params.id },
    data: {
      ...body,
      email: body.email !== undefined ? body.email || null : undefined,
      followUpDate: body.followUpDate !== undefined ? (body.followUpDate ? new Date(body.followUpDate) : null) : undefined,
    },
  });
  res.json({ success: true, data: customer });
});

export const addFollowUp = asyncHandler(async (req: Request, res: Response) => {
  const customer = await prisma.customer.findUnique({ where: { id: req.params.id } });
  if (!customer) throw ApiError.notFound("Customer not found");

  const { note, followUpDate } = req.body;

  const [followUp] = await prisma.$transaction([
    prisma.followUp.create({
      data: {
        customerId: customer.id,
        note,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        createdById: req.user!.sub,
      },
    }),
    ...(followUpDate
      ? [prisma.customer.update({ where: { id: customer.id }, data: { followUpDate: new Date(followUpDate) } })]
      : []),
  ]);

  res.status(201).json({ success: true, data: followUp });
});
