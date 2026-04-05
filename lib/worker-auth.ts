import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export function getWorkerAuthCookieName() {
  return "worker-token";
}

export async function getAuthenticatedWorker() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getWorkerAuthCookieName())?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      id: decoded.id,
      email: decoded.email,
      fullName: decoded.fullName,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}
