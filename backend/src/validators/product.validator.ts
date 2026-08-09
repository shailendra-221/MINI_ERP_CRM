import { z } from "zod";

const productBase = {
  name: z.string().min(2, "Name must be at least 2 characters"),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().optional(),
  unitPrice: z.number().nonnegative("Unit price cannot be negative"),
  currentStock: z.number().int().nonnegative().optional(),
  minStockAlertQty: z.number().int().nonnegative().optional(),
  location: z.string().optional(),
};

export const createProductSchema = z.object({
  body: z.object(productBase),
});

export const updateProductSchema = z.object({
  body: z.object(productBase).partial(),
  params: z.object({ id: z.string().uuid() }),
});

export const stockMovementSchema = z.object({
  body: z.object({
    quantity: z.number().int().positive("Quantity must be greater than 0"),
    movementType: z.enum(["IN", "OUT"]),
    reason: z.string().min(1, "Reason is required"),
  }),
  params: z.object({ id: z.string().uuid() }),
});
