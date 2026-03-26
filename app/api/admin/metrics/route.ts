import { NextResponse } from "next/server";

import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { getAdminAnalytics } from "@/lib/admin-analytics";
import { ensureDatabaseCollections } from "@/lib/models/init";
import { seedInitialDataIfEmpty } from "@/lib/seed";

export async function GET() {
  try {
    await connectToDatabase();
    await ensureDatabaseCollections();
    await seedInitialDataIfEmpty();

    const admin = await getAuthenticatedAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const analytics = await getAdminAnalytics();

    return NextResponse.json(analytics);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch admin metrics",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

