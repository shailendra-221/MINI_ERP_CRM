import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { signToken } from "../utils/jwt";

const allowedRoles = ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"] as const;

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) throw ApiError.unauthorized("Invalid email or password");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw ApiError.unauthorized("Invalid email or password");

  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  res.json({
    success: true,
    data: {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    },
  });
});

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  const trimmedName = String(name || "").trim();
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const selectedRole = allowedRoles.includes(role as (typeof allowedRoles)[number])
    ? (role as (typeof allowedRoles)[number])
    : "SALES";

  if (!trimmedName) throw ApiError.badRequest("Name is required");
  if (!normalizedEmail) throw ApiError.badRequest("Email is required");
  if (password.length < 8) throw ApiError.badRequest("Password must be at least 8 characters long");

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) throw ApiError.badRequest("An account with this email already exists");

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name: trimmedName,
      email: normalizedEmail,
      passwordHash,
      role: selectedRole,
    },
  });

  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  res.status(201).json({
    success: true,
    data: {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    },
  });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
  if (!user) throw ApiError.notFound("User not found");
  res.json({
    success: true,
    data: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});
