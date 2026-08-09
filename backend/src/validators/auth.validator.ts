import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Valid email is required"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const signupSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Valid email is required"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    role: z.enum(["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"]).optional().default("SALES"),
  }),
});
