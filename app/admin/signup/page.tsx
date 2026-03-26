import { redirect } from "next/navigation";
import Link from "next/link";

import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { AdminModel } from "@/lib/models/Admin";
import { ensureDatabaseCollections } from "@/lib/models/init";

import { AdminSignupForm } from "./AdminSignupForm";

export const dynamic = "force-dynamic";

export default async function AdminSignupPage() {
  try {
    await connectToDatabase();
    await ensureDatabaseCollections();
  } catch {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-3xl border border-rose-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-black text-slate-900">Admin Signup Unavailable</h1>
          <p className="mt-2 text-sm text-slate-600">
            Database connection failed. Please verify `MONGODB_URI` and Atlas network allowlist.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/admin/login" className="rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white">
              Go to Admin Login
            </Link>
            <Link href="/" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const adminCount = await AdminModel.countDocuments();
  const admin = await getAuthenticatedAdmin();

  if (adminCount > 0 && !admin) {
    redirect("/admin/login");
  }

  return <AdminSignupForm />;
}

