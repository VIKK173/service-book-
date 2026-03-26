import { NextResponse } from "next/server";

import { getAdminAnalytics } from "@/lib/admin-analytics";
import { connectToDatabase } from "@/lib/db";
import { ensureDatabaseCollections } from "@/lib/models/init";
import { seedInitialDataIfEmpty } from "@/lib/seed";

export async function GET() {
  try {
    await connectToDatabase();
    await ensureDatabaseCollections();
    await seedInitialDataIfEmpty();

    const analytics = await getAdminAnalytics();

    return NextResponse.json({
      totals: analytics.totals,
      dailyBookings: analytics.dailyBookings,
      monthlyEarnings: analytics.monthlyEarnings,
      recentBookings: [],
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch public stats",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

