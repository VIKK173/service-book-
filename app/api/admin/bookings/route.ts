import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db";
import { BookingModel } from "@/lib/models/Booking";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { ensureDatabaseCollections } from "@/lib/models/init";
import { WorkerModel } from "@/lib/models/Worker";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    await ensureDatabaseCollections();

    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const bookings = await BookingModel.find({})
      .populate("userId", "fullName email")
      .populate("serviceId", "name category")
      .populate("workerId", "fullName phone category")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const serialized = bookings.map((b: any) => ({
      _id: b._id.toString(),
      bookingCode: b.bookingCode,
      status: b.status,
      paymentStatus: b.paymentStatus,
      amount: b.amount,
      bookingDate: b.bookingDate?.toISOString() ?? null,
      createdAt: b.createdAt?.toISOString() ?? null,
      subService: b.subService ?? "",
      notes: b.notes ?? "",
      address: b.address ?? {},
      customer: b.userId
        ? { fullName: b.userId.fullName, email: b.userId.email }
        : { fullName: "Guest Customer", email: "customer@servicehub.local" },
      service: b.serviceId
        ? { name: b.serviceId.name, category: b.serviceId.category }
        : { name: "Service", category: "" },
      worker: b.workerId
        ? { _id: b.workerId._id.toString(), fullName: b.workerId.fullName, phone: b.workerId.phone }
        : null,
    }));

    return NextResponse.json({ bookings: serialized });
  } catch (err) {
    console.error("[admin-bookings-get]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectToDatabase();
    await ensureDatabaseCollections();

    const admin = await getAuthenticatedAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { bookingId, action } = await req.json();
    if (!bookingId || !["complete", "cancel"].includes(action)) {
      return NextResponse.json({ error: "Valid bookingId and action are required" }, { status: 400 });
    }

    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (action === "complete") {
      booking.status = "completed";
      booking.paymentStatus = booking.paymentStatus === "failed" ? "failed" : "paid";
      booking.completedAt = new Date();
    }

    if (action === "cancel") {
      booking.status = "cancelled";
    }

    await booking.save();

    if (booking.workerId) {
      await WorkerModel.findByIdAndUpdate(booking.workerId, {
        dutyStatus: action === "complete" || action === "cancel" ? "available" : "busy",
        isAvailable: action === "complete" || action === "cancel",
      });
    }

    return NextResponse.json({
      success: true,
      message: action === "complete" ? "Booking marked completed" : "Booking cancelled",
    });
  } catch (err) {
    console.error("[admin-bookings-patch]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
