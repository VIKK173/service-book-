import { NextResponse } from "next/server";

import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { BookingModel } from "@/lib/models/Booking";
import { ensureDatabaseCollections } from "@/lib/models/init";
import { PaymentModel } from "@/lib/models/Payment";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  try {
    await connectToDatabase();
    await ensureDatabaseCollections();

    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paymentId, action } = await req.json();

    if (!paymentId || !["mark_paid", "refund"].includes(action)) {
      return NextResponse.json({ error: "Valid paymentId and action are required" }, { status: 400 });
    }

    const payment = await PaymentModel.findById(paymentId);
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (action === "mark_paid") {
      payment.status = "paid";
      payment.paidAt = new Date();
      if (!payment.transactionId) {
        payment.transactionId = `TXN${Date.now()}`;
      }
    }

    if (action === "refund") {
      payment.status = "refunded";
    }

    await payment.save();

    await BookingModel.findByIdAndUpdate(payment.bookingId, {
      paymentStatus: payment.status,
    });

    return NextResponse.json({
      success: true,
      message: action === "mark_paid" ? "Payment marked paid" : "Refund issued",
    });
  } catch (error) {
    console.error("[admin-payments-patch]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
