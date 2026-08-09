import { z } from "zod";

const challanItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive("Quantity must be greater than 0"),
});

export const createChallanSchema = z.object({
  body: z.object({
    customerId: z.string().uuid("A valid customer must be selected"),
    items: z.array(challanItemSchema).min(1, "At least one product line is required"),
    status: z.enum(["DRAFT", "CONFIRMED"]).default("DRAFT"),
  }),
});

export const updateChallanSchema = z.object({
  body: z.object({
    customerId: z.string().uuid().optional(),
    items: z.array(challanItemSchema).min(1).optional(),
  }),
  params: z.object({ id: z.string().uuid() }),
});

export const changeChallanStatusSchema = z.object({
  body: z.object({
    status: z.enum(["CONFIRMED", "CANCELLED"]),
  }),
  params: z.object({ id: z.string().uuid() }),
});
