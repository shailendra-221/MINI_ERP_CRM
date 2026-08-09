import { api } from "./client";
import { Customer, Paginated, FollowUp } from "./types";

export interface CustomerListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customerType?: string;
}

export async function fetchCustomers(params: CustomerListParams) {
  const res = await api.get<Paginated<Customer>>("/customers", { params });
  return res.data;
}

export async function fetchCustomer(id: string) {
  const res = await api.get<{ success: boolean; data: Customer }>(`/customers/${id}`);
  return res.data.data;
}

export type CustomerFormValues = Omit<Customer, "id" | "createdAt" | "followUps" | "challans">;

export async function createCustomer(payload: Partial<CustomerFormValues>) {
  const res = await api.post<{ success: boolean; data: Customer }>("/customers", payload);
  return res.data.data;
}

export async function updateCustomer(id: string, payload: Partial<CustomerFormValues>) {
  const res = await api.put<{ success: boolean; data: Customer }>(`/customers/${id}`, payload);
  return res.data.data;
}

export async function addFollowUp(id: string, note: string, followUpDate?: string) {
  const res = await api.post<{ success: boolean; data: FollowUp }>(`/customers/${id}/follow-ups`, {
    note,
    followUpDate,
  });
  return res.data.data;
}
