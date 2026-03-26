import { NextResponse } from "next/server";

import { getAdminDashboardData } from "@/lib/admin-dashboard";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { ensureDatabaseCollections } from "@/lib/models/init";
import { seedInitialDataIfEmpty } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    await ensureDatabaseCollections();
    await seedInitialDataIfEmpty();

    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await getAdminDashboardData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[admin-dashboard-get]", error);
    return NextResponse.json({ error: "Failed to load admin dashboard data" }, { status: 500 });
  }
}
