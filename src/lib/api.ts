export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5051";

export type User = {
  id: number;
  email: string;
  displayName: string;
  role: "User" | "Admin";
  createdAt: string;
};

export type AuthResponse = {
  token: string;
  expiresAt: string;
  user: User;
};

export type ForgotPasswordResponse = {
  message: string;
  resetToken: string | null;
};

export type Product = {
  id: number;
  name: string;
  category: string;
  description: string;
  priceVnd: number;
  imageUrl: string;
  imageAlt: string;
  sortOrder: number;
};

export type City = {
  id: number;
  name: string;
  maisonCount: number;
  kind: string;
  address: string;
  sortOrder: number;
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
