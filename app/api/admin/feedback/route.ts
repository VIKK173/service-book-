import { NextResponse } from "next/server";

import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { ensureDatabaseCollections } from "@/lib/models/init";
import { FeedbackModel } from "@/lib/models/Feedback";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  try {
    await connectToDatabase();
    await ensureDatabaseCollections();

    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { feedbackId, action, reply } = await req.json();

    if (!feedbackId || !["reply", "flag"].includes(action)) {
      return NextResponse.json({ error: "Valid feedbackId and action are required" }, { status: 400 });
    }

    const feedback = await FeedbackModel.findById(feedbackId);
    if (!feedback) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (action === "reply") {
      if (!reply || !String(reply).trim()) {
        return NextResponse.json({ error: "Reply text is required" }, { status: 400 });
      }

      feedback.adminReply = String(reply).trim();
    }

    if (action === "flag") {
      feedback.isFlagged = true;
    }

    await feedback.save();

    return NextResponse.json({
      success: true,
      message: action === "reply" ? "Reply added" : "Review flagged for moderation",
    });
  } catch (error) {
    console.error("[admin-feedback-patch]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
