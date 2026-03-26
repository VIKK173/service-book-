import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { BookingModel } from "@/lib/models/Booking";
import { WorkerModel } from "@/lib/models/Worker";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import mongoose from "mongoose";
import { ensureDatabaseCollections } from "@/lib/models/init";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    await ensureDatabaseCollections();

    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bookingId, workerId } = await req.json();
    if (!bookingId || !workerId) {
      return NextResponse.json({ error: "bookingId and workerId are required" }, { status: 400 });
    }

    const booking = await BookingModel.findById(bookingId);
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    const worker = await WorkerModel.findOne({ _id: workerId, isActive: true });
    if (!worker) return NextResponse.json({ error: "Worker not found" }, { status: 404 });

    await BookingModel.findByIdAndUpdate(bookingId, {
      workerId: new mongoose.Types.ObjectId(workerId),
      status: "confirmed",
    });

    await WorkerModel.findByIdAndUpdate(workerId, {
      dutyStatus: "busy",
      isAvailable: false,
    });

    return NextResponse.json({
      success: true,
      message: "Worker assigned",
    });
  } catch (err) {
    console.error("[admin-assign-worker]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
