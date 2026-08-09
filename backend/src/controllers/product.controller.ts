import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(parseInt(String(req.query.page || "1"), 10), 1);
  const limit = Math.min(Math.max(parseInt(String(req.query.limit || "10"), 10), 1), 100);
  const search = String(req.query.search || "").trim();
  const category = req.query.category ? String(req.query.category) : undefined;
  const lowStockOnly = req.query.lowStock === "true";

  const where: Prisma.ProductWhereInput = {
    AND: [
      search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { sku: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
      category ? { category } : {},
    ],
  };

  let items = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  if (lowStockOnly) {
    items = items.filter((p) => p.currentStock <= p.minStockAlertQty);
  }

  const total = items.length;
  const paginated = items.slice((page - 1) * limit, (page - 1) * limit + limit);

  res.json({
    success: true,
    data: paginated,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: {
      stockMovements: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { createdBy: { select: { name: true } } },
      },
    },
  });
  if (!product) throw ApiError.notFound("Product not found");
  res.json({ success: true, data: product });
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body;
  const product = await prisma.product.create({
    data: {
      name: body.name,
      sku: body.sku,
      category: body.category || null,
      unitPrice: body.unitPrice,
      currentStock: body.currentStock ?? 0,
      minStockAlertQty: body.minStockAlertQty ?? 0,
      location: body.location || null,
    },
  });

  // Record the initial stock as an IN movement so the log is complete.
  if (product.currentStock > 0) {
    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        quantity: product.currentStock,
        movementType: "IN",
        reason: "Initial stock on product creation",
        createdById: req.user!.sub,
      },
    });
  }

  res.status(201).json({ success: true, data: product });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!existing) throw ApiError.notFound("Product not found");

  // currentStock is intentionally NOT editable here — it must only change
  // via the stock movement endpoint so the movement log stays authoritative.
  const { currentStock, ...rest } = req.body;

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: rest,
  });
  res.json({ success: true, data: product });
});

export const addStockMovement = asyncHandler(async (req: Request, res: Response) => {
  const { quantity, movementType, reason } = req.body;

  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) throw ApiError.notFound("Product not found");

  const newStock = movementType === "IN" ? product.currentStock + quantity : product.currentStock - quantity;

  if (newStock < 0) {
    throw ApiError.badRequest(
      `Insufficient stock: only ${product.currentStock} unit(s) of "${product.name}" available.`
    );
  }

  const [, movement] = await prisma.$transaction([
    prisma.product.update({ where: { id: product.id }, data: { currentStock: newStock } }),
    prisma.stockMovement.create({
      data: {
        productId: product.id,
        quantity,
        movementType,
        reason,
        createdById: req.user!.sub,
      },
    }),
  ]);

  res.status(201).json({ success: true, data: movement, currentStock: newStock });
});
