import { api } from "./client";
import { AuthUser, Role } from "./types";

export async function loginRequest(email: string, password: string) {
  const res = await api.post<{ success: boolean; data: { token: string; user: AuthUser } }>('/auth/login', {
    email,
    password,
  });
  return res.data.data;
}

export async function registerRequest(name: string, email: string, password: string, role: Role = "SALES") {
  const res = await api.post<{ success: boolean; data: { token: string; user: AuthUser } }>('/auth/signup', {
    name,
    email,
    password,
    role,
  });
  return res.data.data;
}
