export type Role = "ADMIN" | "SALES" | "WAREHOUSE" | "ACCOUNTS";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export type CustomerType = "RETAIL" | "WHOLESALE" | "DISTRIBUTOR";
export type CustomerStatus = "LEAD" | "ACTIVE" | "INACTIVE";

export interface FollowUp {
  id: string;
  customerId: string;
  note: string;
  followUpDate: string | null;
  createdAt: string;
  createdBy?: { name: string } | null;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string | null;
  businessName?: string | null;
  gstNumber?: string | null;
  customerType: CustomerType;
  address?: string | null;
  status: CustomerStatus;
  followUpDate?: string | null;
  notes?: string | null;
  createdAt: string;
  followUps?: FollowUp[];
  challans?: Challan[];
}

export interface StockMovement {
  id: string;
  productId: string;
  quantity: number;
  movementType: "IN" | "OUT";
  reason: string;
  createdAt: string;
  createdBy?: { name: string } | null;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category?: string | null;
  unitPrice: string | number;
  currentStock: number;
  minStockAlertQty: number;
  location?: string | null;
  createdAt: string;
  stockMovements?: StockMovement[];
}

export type ChallanStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";

export interface ChallanItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  unitPrice: string | number;
  quantity: number;
  lineTotal: string | number;
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  customer?: Customer;
  totalQuantity: number;
  status: ChallanStatus;
  items: ChallanItem[];
  createdAt: string;
  confirmedAt?: string | null;
  cancelledAt?: string | null;
  createdBy?: { name: string; email: string } | null;
}

export interface Paginated<T> {
  success: boolean;
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}
