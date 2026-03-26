import { redirect } from "next/navigation";

import { getAuthenticatedAdmin } from "@/lib/admin-auth";

export default async function AdminIndexPage() {
  const admin = await getAuthenticatedAdmin();

  if (admin) {
    redirect("/admin/dashboard");
  }

  redirect("/admin/login");
}

