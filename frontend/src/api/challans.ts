import { api } from "./client";
import { Challan, Paginated, ChallanStatus } from "./types";

export interface ChallanListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customerId?: string;
}

export async function fetchChallans(params: ChallanListParams) {
  const res = await api.get<Paginated<Challan>>("/challans", { params });
  return res.data;
}

export async function fetchChallan(id: string) {
  const res = await api.get<{ success: boolean; data: Challan }>(`/challans/${id}`);
  return res.data.data;
}

export async function createChallan(payload: {
  customerId: string;
  items: { productId: string; quantity: number }[];
  status: "DRAFT" | "CONFIRMED";
}) {
  const res = await api.post<{ success: boolean; data: Challan }>("/challans", payload);
  return res.data.data;
}

export async function changeChallanStatus(id: string, status: ChallanStatus) {
  const res = await api.patch<{ success: boolean; data: Challan }>(`/challans/${id}/status`, { status });
  return res.data.data;
}
