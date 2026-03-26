import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Bell,
  Briefcase,
  CalendarCheck2,
  LayoutDashboard,
  Search,
  Settings,
  Shield,
  Sparkles,
  Users,
  UserCog,
  Wallet,
  Wrench,
  TrendingUp,
  CircleDollarSign,
} from "lucide-react";

import { AdminLogoutButton } from "@/app/components/AdminLogoutButton";
import { getAdminAnalytics } from "@/lib/admin-analytics";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { ensureDatabaseCollections } from "@/lib/models/init";
import { seedInitialDataIfEmpty } from "@/lib/seed";

export const dynamic = "force-dynamic";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

export default async function AdminDashboardPage() {
  try {
    await connectToDatabase();
    await ensureDatabaseCollections();
    await seedInitialDataIfEmpty();
  } catch {
    return (
      <main className="min-h-screen bg-slate-100 text-slate-900 flex items-center justify-center p-6">
        <div className="w-full max-w-xl rounded-3xl border border-rose-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-black text-slate-900">Admin Dashboard Unavailable</h1>
          <p className="mt-2 text-sm text-slate-600">
            Database connection failed. Please check `MONGODB_URI` and network access to MongoDB Atlas.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/admin/login"
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Back to Admin Login
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const metrics = await getAdminAnalytics();

  const maxDaily = Math.max(...metrics.dailyBookings.map((x) => x.bookings), 1);
  const dailyPoints = metrics.dailyBookings
    .map((entry, index) => {
      const x = (index / Math.max(metrics.dailyBookings.length - 1, 1)) * 100;
      const y = 100 - (entry.bookings / maxDaily) * 80;
      return `${x},${y}`;
    })
    .join(" ");

  const maxMonthly = Math.max(...metrics.monthlyEarnings.map((x) => x.earnings), 1);

  const cards = [
    {
      label: "Total Users",
      value: formatCount(metrics.totals.totalUsers),
      icon: Users,
      subtitle: "Registered customers",
      className: "from-indigo-600 to-blue-600",
    },
    {
      label: "Total Workers",
      value: formatCount(metrics.totals.totalWorkers),
      icon: UserCog,
      subtitle: "Active professionals",
      className: "from-orange-500 to-amber-500",
    },
    {
      label: "Total Bookings",
      value: formatCount(metrics.totals.totalBookings),
      icon: Briefcase,
      subtitle: "All-time orders",
      className: "from-emerald-500 to-teal-500",
    },
    {
      label: "Completed Orders",
      value: formatCount(metrics.totals.completedOrders),
      icon: CalendarCheck2,
      subtitle: "Successfully delivered",
      className: "from-fuchsia-500 to-purple-500",
    },
    {
      label: "Pending Orders",
      value: formatCount(metrics.totals.pendingOrders),
      icon: TrendingUp,
      subtitle: "Need attention",
      className: "from-sky-500 to-cyan-500",
    },
    {
      label: "Revenue",
      value: formatCurrency(metrics.totals.revenue),
      icon: CircleDollarSign,
      subtitle: "From completed jobs",
      className: "from-violet-600 to-indigo-700",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1700px]">
        <aside className="hidden w-72 border-r border-slate-200 bg-white px-6 py-8 lg:flex lg:flex-col">
          <div className="mb-10 flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-3 text-white shadow-lg shadow-indigo-500/30">
              <Shield className="h-7 w-7" />
            </div>
            <div>
              <p className="text-3xl font-black leading-none">ServiceHub</p>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">Admin Core</p>
            </div>
          </div>

          <nav className="space-y-3">
            <button className="flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/30">
              <LayoutDashboard className="h-5 w-5" /> Dashboard
            </button>
            <Link href="/admin/bookings" className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
              <Briefcase className="h-5 w-5" /> Bookings
            </Link>
            <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
              <Wrench className="h-5 w-5" /> Workers
            </button>
            <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
              <Wallet className="h-5 w-5" /> Finance
            </button>
            <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
              <Settings className="h-5 w-5" /> Settings
            </button>
          </nav>

          <div className="mt-auto rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-xl">
            <p className="text-xl font-bold">Enterprise Admin</p>
            <p className="mt-1 text-sm text-white/80">Control users, workers, services and earnings in one place.</p>
            <div className="mt-4">
              <AdminLogoutButton />
            </div>
          </div>
        </aside>

        <section className="flex-1">
          <header className="border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur sm:px-8">
            <div className="flex items-center justify-between gap-4">
              <label className="hidden w-full max-w-xl items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500 sm:flex">
                <Search className="h-4 w-4" />
                <input
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="Search users, bookings, workers..."
                />
              </label>

              <div className="ml-auto flex items-center gap-4">
                <button className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                  <Bell className="h-5 w-5" />
                </button>
                <div className="text-right">
                  <p className="font-bold leading-tight">{admin.fullName}</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{admin.role.replace("_", " ")}</p>
                </div>
              </div>
            </div>
          </header>

          <div className="space-y-6 p-5 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="bg-gradient-to-r from-indigo-600 to-fuchsia-500 bg-clip-text font-display text-5xl font-black text-transparent">
                  Admin Insights
                </h1>
                <p className="mt-1 text-lg text-slate-600">Home service performance metrics</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-500/30">
                  <Sparkles className="h-4 w-4" /> Real-time Sync Active
                </span>
                <Link href="/admin/signup" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-500 hover:text-indigo-600">
                  Create Admin
                </Link>
                <Link href="/" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-500 hover:text-indigo-600">
                  Back To Home
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              {cards.map((card) => {
                const Icon = card.icon;
                return (
                  <article
                    key={card.label}
                    className={`rounded-[1.7rem] bg-gradient-to-br ${card.className} p-6 text-white shadow-xl`}
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <span className="rounded-2xl bg-white/20 p-3 backdrop-blur">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">Live</span>
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">{card.label}</p>
                    <p className="mt-2 font-display text-4xl font-black">{card.value}</p>
                    <p className="mt-1 text-sm text-white/80">{card.subtitle}</p>
                  </article>
                );
              })}
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              <article className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm xl:col-span-2">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black">Daily Bookings</h2>
                    <p className="text-sm text-slate-500">Trend for last 14 days</p>
                  </div>
                  <span className="rounded-xl bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-600">Last 14 Days</span>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <svg viewBox="0 0 100 100" className="h-72 w-full">
                    <defs>
                      <linearGradient id="dashboardLine" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4f46e5" />
                        <stop offset="100%" stopColor="#9333ea" />
                      </linearGradient>
                    </defs>
                    <polyline
                      points={dailyPoints}
                      fill="none"
                      stroke="url(#dashboardLine)"
                      strokeWidth="2.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="mt-1 grid grid-cols-7 gap-2 text-center text-[11px] font-bold text-slate-500">
                    {metrics.dailyBookings.slice(-7).map((entry) => (
                      <span key={entry.date}>{entry.date}</span>
                    ))}
                  </div>
                </div>
              </article>

              <article className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black">Monthly Earnings</h2>
                    <p className="text-sm text-slate-500">Current year revenue</p>
                  </div>
                  <span className="text-xl font-black text-emerald-500">?</span>
                </div>

                <div className="space-y-3">
                  {metrics.monthlyEarnings.slice(-6).map((month) => {
                    const width = Math.max((month.earnings / maxMonthly) * 100, 4);
                    return (
                      <div key={month.month} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                          <span>{month.month}</span>
                          <span>{formatCurrency(month.earnings)}</span>
                        </div>
                        <div className="h-3 rounded-full bg-slate-100">
                          <div
                            className="h-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
