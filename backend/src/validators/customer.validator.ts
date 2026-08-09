import { z } from "zod";

const customerBase = {
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobile: z.string().regex(/^\+?[0-9]{10,15}$/, "Enter a valid mobile number"),
  email: z.string().email().optional().or(z.literal("")).optional(),
  businessName: z.string().optional(),
  gstNumber: z.string().optional(),
  customerType: z.enum(["RETAIL", "WHOLESALE", "DISTRIBUTOR"]).default("RETAIL"),
  address: z.string().optional(),
  status: z.enum(["LEAD", "ACTIVE", "INACTIVE"]).default("LEAD"),
  followUpDate: z.string().datetime().optional().or(z.literal("")).optional(),
  notes: z.string().optional(),
};

export const createCustomerSchema = z.object({
  body: z.object(customerBase),
});

export const updateCustomerSchema = z.object({
  body: z.object(customerBase).partial(),
  params: z.object({ id: z.string().uuid() }),
});

export const addFollowUpSchema = z.object({
  body: z.object({
    note: z.string().min(1, "Note is required"),
    followUpDate: z.string().datetime().optional().or(z.literal("")).optional(),
  }),
  params: z.object({ id: z.string().uuid() }),
});
