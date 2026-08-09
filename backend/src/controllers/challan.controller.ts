import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { generateChallanNumber } from "../utils/generateChallanNumber";

export const listChallans = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(parseInt(String(req.query.page || "1"), 10), 1);
  const limit = Math.min(Math.max(parseInt(String(req.query.limit || "10"), 10), 1), 100);
  const status = req.query.status ? String(req.query.status) : undefined;
  const customerId = req.query.customerId ? String(req.query.customerId) : undefined;
  const search = String(req.query.search || "").trim();

  const where: Prisma.ChallanWhereInput = {
    AND: [
      status ? { status: status as any } : {},
      customerId ? { customerId } : {},
      search
        ? {
            OR: [
              { challanNumber: { contains: search, mode: "insensitive" } },
              { customer: { name: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {},
    ],
  };

  const [items, total] = await Promise.all([
    prisma.challan.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { id: true, name: true, mobile: true } }, items: true },
    }),
    prisma.challan.count({ where }),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

export const getChallan = asyncHandler(async (req: Request, res: Response) => {
  const challan = await prisma.challan.findUnique({
    where: { id: req.params.id },
    include: {
      customer: true,
      items: true,
      createdBy: { select: { name: true, email: true } },
    },
  });
  if (!challan) throw ApiError.notFound("Challan not found");
  res.json({ success: true, data: challan });
});

/**
 * Creates a challan. If status is CONFIRMED at creation time, stock is
 * validated and reduced atomically as part of the same transaction; if any
 * item has insufficient stock, the whole operation is rolled back and a
 * 400 error is returned (stock is never allowed to go negative).
 */
export const createChallan = asyncHandler(async (req: Request, res: Response) => {
  const { customerId, items, status } = req.body as {
    customerId: string;
    items: { productId: string; quantity: number }[];
    status: "DRAFT" | "CONFIRMED";
  };

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) throw ApiError.badRequest("Selected customer does not exist");

  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

  if (products.length !== new Set(productIds).size) {
    throw ApiError.badRequest("One or more selected products do not exist");
  }

  const productMap = new Map(products.map((p) => [p.id, p]));

  // Build snapshot line items + validate stock up-front for a clean error message.
  let totalQuantity = 0;
  const lineItems = items.map((line) => {
    const product = productMap.get(line.productId)!;
    totalQuantity += line.quantity;

    if (status === "CONFIRMED" && product.currentStock < line.quantity) {
      throw ApiError.badRequest(
        `Insufficient stock for "${product.name}" (SKU ${product.sku}): requested ${line.quantity}, available ${product.currentStock}.`
      );
    }

    return {
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      unitPrice: product.unitPrice,
      quantity: line.quantity,
      lineTotal: Number(product.unitPrice) * line.quantity,
    };
  });

  const challanNumber = await generateChallanNumber();

  const challan = await prisma.$transaction(async (tx) => {
    const created = await tx.challan.create({
      data: {
        challanNumber,
        customerId,
        totalQuantity,
        status,
        createdById: req.user!.sub,
        confirmedAt: status === "CONFIRMED" ? new Date() : null,
        items: { create: lineItems },
      },
      include: { items: true, customer: true },
    });

    if (status === "CONFIRMED") {
      for (const line of lineItems) {
        const product = productMap.get(line.productId)!;
        const newStock = product.currentStock - line.quantity;
        if (newStock < 0) {
          // Defensive re-check inside the transaction in case of a race condition.
          throw ApiError.badRequest(`Insufficient stock for "${product.name}" while confirming challan.`);
        }
        await tx.product.update({ where: { id: product.id }, data: { currentStock: newStock } });
        await tx.stockMovement.create({
          data: {
            productId: product.id,
            quantity: line.quantity,
            movementType: "OUT",
            reason: `Challan ${challanNumber} confirmed`,
            createdById: req.user!.sub,
          },
        });
      }
    }

    return created;
  });

  res.status(201).json({ success: true, data: challan });
});

/**
 * Transitions a challan's status.
 * DRAFT -> CONFIRMED : validates & reduces stock atomically.
 * DRAFT -> CANCELLED : no stock impact (nothing was ever deducted).
 * CONFIRMED -> CANCELLED : restores stock that was previously deducted.
 */
export const changeChallanStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status: nextStatus } = req.body as { status: "CONFIRMED" | "CANCELLED" };

  const challan = await prisma.challan.findUnique({
    where: { id: req.params.id },
    include: { items: true },
  });
  if (!challan) throw ApiError.notFound("Challan not found");

  if (challan.status === "CANCELLED") {
    throw ApiError.badRequest("A cancelled challan cannot be modified.");
  }
  if (challan.status === "CONFIRMED" && nextStatus === "CONFIRMED") {
    throw ApiError.badRequest("Challan is already confirmed.");
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (nextStatus === "CONFIRMED") {
      // DRAFT -> CONFIRMED: validate and reduce stock now.
      for (const item of challan.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw ApiError.badRequest(`Product ${item.productName} no longer exists.`);
        const newStock = product.currentStock - item.quantity;
        if (newStock < 0) {
          throw ApiError.badRequest(
            `Insufficient stock for "${product.name}": requested ${item.quantity}, available ${product.currentStock}.`
          );
        }
        await tx.product.update({ where: { id: product.id }, data: { currentStock: newStock } });
        await tx.stockMovement.create({
          data: {
            productId: product.id,
            quantity: item.quantity,
            movementType: "OUT",
            reason: `Challan ${challan.challanNumber} confirmed`,
            createdById: req.user!.sub,
          },
        });
      }
    }

    if (nextStatus === "CANCELLED" && challan.status === "CONFIRMED") {
      // CONFIRMED -> CANCELLED: restore stock that was deducted on confirm.
      for (const item of challan.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: { increment: item.quantity } },
        });
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            movementType: "IN",
            reason: `Challan ${challan.challanNumber} cancelled - stock restored`,
            createdById: req.user!.sub,
          },
        });
      }
    }

    return tx.challan.update({
      where: { id: challan.id },
      data: {
        status: nextStatus,
        confirmedAt: nextStatus === "CONFIRMED" ? new Date() : challan.confirmedAt,
        cancelledAt: nextStatus === "CANCELLED" ? new Date() : null,
      },
      include: { items: true, customer: true },
    });
  });

  res.json({ success: true, data: updated });
});
