import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { AdminModel } from "@/lib/models/Admin";
import { ensureDatabaseCollections } from "@/lib/models/init";
import { seedInitialDataIfEmpty } from "@/lib/seed";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const fullName = String(payload.fullName ?? "").trim();
    const email = String(payload.email ?? "").trim().toLowerCase();
    const password = String(payload.password ?? "");
    const phone = String(payload.phone ?? "").trim();

    if (!fullName || fullName.length < 2) {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    await connectToDatabase();
    await ensureDatabaseCollections();
    await seedInitialDataIfEmpty();

    const adminCount = await AdminModel.countDocuments();

    if (adminCount > 0) {
      const loggedInAdmin = await getAuthenticatedAdmin();

      if (!loggedInAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const existingAdmin = await AdminModel.findOne({ email }).lean();

    if (existingAdmin) {
      return NextResponse.json({ error: "Admin already exists with this email" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const createdAdmin = await AdminModel.create({
      fullName,
      email,
      passwordHash,
      phone,
      role: "super_admin",
      isActive: true,
    });

    return NextResponse.json(
      {
        message: "Admin created successfully",
        admin: {
          id: String(createdAdmin._id),
          fullName: createdAdmin.fullName,
          email: createdAdmin.email,
          role: createdAdmin.role,
          createdAt: createdAdmin.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to create admin",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

