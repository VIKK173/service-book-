import { NextResponse } from "next/server";

import { PROS } from "@/lib/data";
import { connectToDatabase } from "@/lib/db";
import { WorkerModel } from "@/lib/models/Worker";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { ensureDatabaseCollections } from "@/lib/models/init";

export const dynamic = "force-dynamic";

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export async function GET() {
  try {
    await connectToDatabase();
    await ensureDatabaseCollections();

    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const workers = await WorkerModel.find({ isActive: true })
      .select("fullName email phone category city rating totalJobs isAvailable photoUrl dutyStatus")
      .sort({ fullName: 1 })
      .lean();

    const serialized = workers.map((w: any) => ({
      _id: w._id.toString(),
      fullName: w.fullName,
      email: w.email,
      phone: w.phone,
      category: w.category,
      city: w.city,
      rating: w.rating,
      totalJobs: w.totalJobs,
      isAvailable: w.isAvailable,
      photoUrl: w.photoUrl,
      dutyStatus: w.dutyStatus ?? (w.isAvailable ? "available" : "busy"),
    }));

    return NextResponse.json({ workers: serialized });
  } catch (err) {
    console.error("[admin-workers-get]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    await ensureDatabaseCollections();

    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, phone, specialization, city } = await req.json();

    if (!name || !phone || !specialization || !city) {
      return NextResponse.json({ error: "Name, phone, specialization, and city are required" }, { status: 400 });
    }

    const existingCount = await WorkerModel.countDocuments();
    const photoUrl = PROS[existingCount % PROS.length]?.img ?? "";
    const baseSlug = toSlug(name);

    const worker = await WorkerModel.create({
      fullName: name,
      email: `${baseSlug}-${Date.now()}@servicehub.local`,
      password: "worker123",
      phone,
      category: specialization,
      city,
      rating: 4.6,
      totalJobs: 0,
      isAvailable: true,
      dutyStatus: "available",
      photoUrl,
      experienceYears: 1,
    });

    return NextResponse.json({
      success: true,
      message: "Worker added",
      worker: {
        _id: worker._id.toString(),
        fullName: worker.fullName,
      },
    });
  } catch (err) {
    console.error("[admin-workers-post]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectToDatabase();
    await ensureDatabaseCollections();

    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { workerId, dutyStatus } = await req.json();

    if (!workerId || !["available", "busy", "off_duty"].includes(dutyStatus)) {
      return NextResponse.json({ error: "Valid workerId and dutyStatus are required" }, { status: 400 });
    }

    const worker = await WorkerModel.findByIdAndUpdate(
      workerId,
      {
        dutyStatus,
        isAvailable: dutyStatus === "available",
      },
      { new: true },
    );

    if (!worker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `${worker.fullName} marked ${dutyStatus.replace("_", " ")}`,
    });
  } catch (err) {
    console.error("[admin-workers-patch]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
