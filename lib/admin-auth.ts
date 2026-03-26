import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

import { AdminModel } from "@/lib/models/Admin";

const ADMIN_AUTH_COOKIE = "servicehub_admin_token";
const JWT_EXPIRES_IN = "7d";

function getJwtSecret() {
  const secret = process.env.ADMIN_JWT_SECRET;

  if (!secret) {
    throw new Error("Missing ADMIN_JWT_SECRET in .env.local");
  }

  return secret;
}

type AdminTokenPayload = {
  adminId: string;
  email: string;
  role: string;
};

export type AuthenticatedAdmin = {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
};

export function signAdminToken(payload: AdminTokenPayload) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyAdminToken(token: string) {
  return jwt.verify(token, getJwtSecret()) as AdminTokenPayload;
}

export async function getAuthenticatedAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = verifyAdminToken(token);
    const admin = await AdminModel.findOne({ _id: decoded.adminId, isActive: true })
      .select("fullName email role isActive")
      .lean<AuthenticatedAdmin>();
    return admin;
  } catch {
    return null;
  }
}

export function getAdminAuthCookieName() {
  return ADMIN_AUTH_COOKIE;
}

