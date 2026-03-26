import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db";
import { AdminModel } from "@/lib/models/Admin";
import { ensureDatabaseCollections } from "@/lib/models/init";
import { seedInitialDataIfEmpty } from "@/lib/seed";
import { getAdminAuthCookieName, signAdminToken } from "@/lib/admin-auth";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const email = String(payload.email ?? "").trim().toLowerCase();
    const password = String(payload.password ?? "");

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    await connectToDatabase();
    await ensureDatabaseCollections();
    await seedInitialDataIfEmpty();

    const admin = await AdminModel.findOne({ email, isActive: true });

    if (!admin) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const passwordMatches = await bcrypt.compare(password, admin.passwordHash);

    if (!passwordMatches) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    admin.lastLoginAt = new Date();
    await admin.save();

    const token = signAdminToken({
      adminId: String(admin._id),
      email: admin.email,
      role: admin.role,
    });

    const response = NextResponse.json({
      message: "Login successful",
      admin: {
        id: String(admin._id),
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
      },
    });

    response.cookies.set({
      name: getAdminAuthCookieName(),
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to login",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

