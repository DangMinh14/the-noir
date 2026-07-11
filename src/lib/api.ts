export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5051";

// Mirrors ProductService.FallbackImageUrl on the backend: shown whenever a
// product has no photo of its own yet. Served from the API's wwwroot/branding,
// not a static site asset, so it has to go through API_URL like an upload.
export const FALLBACK_PRODUCT_IMAGE = `${API_URL}/branding/product-fallback.jpg`;

// A category with no photo of its own yet resolves to this, kept as a
// distinct asset from the product fallback so the two can evolve independently.
export const FALLBACK_CATEGORY_IMAGE = `${API_URL}/branding/category-fallback.jpg`;

export type User = {
  id: number;
  email: string;
  displayName: string;
  role: "User" | "Admin" | "Staff";
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  token: string;
  expiresAt: string;
  user: User;
};

export type ForgotPasswordResponse = {
  message: string;
};

export type PagedResult<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type Category = {
  id: number;
  name: string;
  productCount: number;
  imageUrl: string;
  imageAlt: string;
  allowsToppings: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: number;
  name: string;
  description: string;
  descriptionHtml: string;
  priceVnd: number;
  categoryId: number;
  categoryName: string;
  categoryAllowsToppings: boolean;
  imageUrl: string;
  imageAlt: string;
  createdAt: string;
  updatedAt: string;
};

export type Topping = {
  id: number;
  name: string;
  priceVnd: number;
  createdAt: string;
  updatedAt: string;
};

export type City = {
  id: number;
  name: string;
  maisonCount: number;
  kind: string;
  address: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type OrderStatus = "Pending" | "Preparing" | "Ready" | "Completed" | "Cancelled";

export type OrderItemTopping = {
  toppingId: number | null;
  name: string;
  priceVnd: number;
};

export type OrderItem = {
  productId: number | null;
  productName: string;
  unitPriceVnd: number;
  quantity: number;
  lineTotalVnd: number;
  iceOption: string | null;
  temperature: string | null;
  sugarLevel: string | null;
  size: string | null;
  sizeSurchargeVnd: number;
  note: string | null;
  toppings: OrderItemTopping[];
};

export type Order = {
  id: number;
  status: OrderStatus;
  cityId: number;
  cityName: string;
  totalVnd: number;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  autoCancelled: boolean;
  // Falls back to the account's display name server-side, so this is only
  // null for the rare guest order placed with an empty name.
  customerName: string | null;
  // False for guest checkouts: no account to reply from, so chat is hidden.
  hasAccount: boolean;
  preparingAt: string | null;
  readyAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  items: OrderItem[];
};

export type OrderMessageSenderRole = "Staff" | "Customer";

export type OrderMessage = {
  id: number;
  senderRole: OrderMessageSenderRole;
  body: string;
  createdAt: string;
};

export type UnseenOrdersSummary = {
  newOrders: number;
  autoCancelled: number;
};

export type CreateOrderRequest = {
  cityId: number;
  items: {
    productId: number;
    quantity: number;
    iceOption?: string;
    temperature?: string;
    sugarLevel?: string;
    size?: string;
    note?: string;
    toppingIds?: number[];
  }[];
  customerName?: string;
};

export type DashboardStats = {
  totalRevenueVnd: number;
  totalOrders: number;
  revenueByDay: { date: string; revenueVnd: number }[];
  topProducts: { productName: string; quantitySold: number; revenueVnd: number }[];
  revenueByCategory: { categoryName: string; revenueVnd: number }[];
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  token?: string | null;
};

function extractMessage(data: unknown, status: number): string {
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (typeof d.error === "string") return d.error;
    // ASP.NET validation problem details: { errors: { Field: ["msg"] } }
    if (d.errors && typeof d.errors === "object") {
      const first = Object.values(d.errors as Record<string, string[]>)[0];
      if (first?.[0]) return first[0];
    }
    if (typeof d.title === "string") return d.title;
  }
  return `Request failed (${status})`;
}

export async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: opts.method ?? "GET",
      headers: {
        ...(opts.body !== undefined && { "Content-Type": "application/json" }),
        ...(opts.token && { Authorization: `Bearer ${opts.token}` }),
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new ApiError("Cannot reach the server. Is the API running?", 0);
  }

  if (res.status === 204) return undefined as T;

  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(extractMessage(data, res.status), res.status);
  return data as T;
}

// Resolves an ImageUrl (already absolute for Unsplash, or a
// server-relative /uploads/... path) to something an <img> can load.
export function resolveImageUrl(url: string, fallback: string = FALLBACK_PRODUCT_IMAGE): string {
  if (!url) return fallback;
  return url.startsWith("/") ? `${API_URL}${url}` : url;
}

export async function uploadImage(
  file: File,
  token: string | null,
): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/uploads/image`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });
  } catch {
    throw new ApiError("Cannot reach the server. Is the API running?", 0);
  }

  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(extractMessage(data, res.status), res.status);
  return (data as { url: string }).url;
}
