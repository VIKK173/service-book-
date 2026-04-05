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
  Home,
  CheckCircle2,
  AlertCircle,
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
      <main className="min-h-screen bg-slate2-50 text-slate2-900 flex items-center justify-center p-6">
        <div className="w-full max-w-xl rounded-3xl border border-rose-200 bg-white p-8 shadow-lg">
          <h1 className="text-2xl font-black text-slate2-900">Admin Dashboard Unavailable</h1>
          <p className="mt-2 text-sm text-slate2-600">
            Database connection failed. Please check `MONGODB_URI` and network access to MongoDB Atlas.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/admin/login"
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Back to Admin Login
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-slate2-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate2-700"
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
      className: "from-brand-500 to-brand-600",
    },
    {
      label: "Total Workers",
      value: formatCount(metrics.totals.totalWorkers),
      icon: UserCog,
      subtitle: "Active professionals",
      className: "from-accent-500 to-accent-600",
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
      className: "from-violet-500 to-purple-500",
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
      className: "from-brand-600 to-brand-700",
    },
  ];

  return (
    <main className="min-h-screen bg-slate2-50 text-slate2-900">
      <div className="mx-auto flex min-h-screen max-w-[1700px]">
        {/* Sidebar */}
        <aside className="hidden w-72 border-r border-slate2-200 bg-white px-6 py-8 lg:flex lg:flex-col shadow-lg">
          {/* Logo */}
          <div className="mb-10 flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 p-3 text-white shadow-lg shadow-brand-500/30">
              <Shield className="h-7 w-7" />
            </div>
            <div>
              <p className="text-3xl font-black leading-none text-slate2-900">ServiceHub</p>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Admin Panel</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <div className="flex w-full items-center gap-3 rounded-xl bg-brand-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/30">
              <LayoutDashboard className="h-5 w-5" /> Dashboard
            </div>
            <Link href="/admin/bookings" className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate2-600 transition hover:bg-brand-50 hover:text-brand-600">
              <Briefcase className="h-5 w-5" /> Bookings
            </Link>
            <Link href="/admin/workers" className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate2-600 transition hover:bg-brand-50 hover:text-brand-600">
              <Wrench className="h-5 w-5" /> Workers
            </Link>
            <Link href="/admin/finance" className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate2-600 transition hover:bg-brand-50 hover:text-brand-600">
              <Wallet className="h-5 w-5" /> Finance
            </Link>
            <Link href="/admin/settings" className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate2-600 transition hover:bg-brand-50 hover:text-brand-600">
              <Settings className="h-5 w-5" /> Settings
            </Link>
          </nav>

          {/* Admin Card */}
          <div className="mt-auto rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white shadow-xl">
            <p className="text-xl font-bold">Admin Control</p>
            <p className="mt-1 text-sm text-white/80">Manage users, workers, services and earnings.</p>
            <div className="mt-4">
              <AdminLogoutButton />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <section className="flex-1">
          {/* Header */}
          <header className="sticky top-0 z-10 border-b border-slate2-200 bg-white/95 px-5 py-4 backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <label className="hidden w-full max-w-xl items-center gap-2 rounded-xl border border-slate2-200 bg-slate2-50 px-4 py-3 text-slate2-500 sm:flex">
                <Search className="h-4 w-4" />
                <input
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="Search users, bookings, workers..."
                />
              </label>

              <div className="ml-auto flex items-center gap-4">
                <button className="rounded-xl bg-slate2-100 p-2.5 text-slate2-600 hover:bg-brand-50 hover:text-brand-600 transition">
                  <Bell className="h-5 w-5" />
                </button>
                <div className="text-right">
                  <p className="font-bold leading-tight text-slate2-900">{admin.fullName}</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">{admin.role.replace("_", " ")}</p>
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="space-y-6 p-5 sm:p-8">
            {/* Title */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text font-display text-4xl font-black text-transparent">
                  Dashboard Overview
                </h1>
                <p className="mt-1 text-lg text-slate2-600">Home service performance metrics</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-brand-500/30">
                  <Sparkles className="h-4 w-4" /> Live Data
                </span>
                <Link href="/admin/signup" className="rounded-xl border border-slate2-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate2-700 transition hover:border-brand-500 hover:text-brand-600">
                  Create Admin
                </Link>
                <Link href="/" className="rounded-xl border border-slate2-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate2-700 transition hover:border-brand-500 hover:text-brand-600 flex items-center gap-2">
                  <Home className="h-4 w-4" /> Back To Home
                </Link>
              </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              {cards.map((card) => {
                const Icon = card.icon;
                return (
                  <article
                    key={card.label}
                    className={`rounded-2xl bg-gradient-to-br ${card.className} p-6 text-white shadow-lg`}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <span className="rounded-xl bg-white/20 p-2.5 backdrop-blur">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">Live</span>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/70">{card.label}</p>
                    <p className="mt-2 font-display text-3xl font-black">{card.value}</p>
                    <p className="mt-1 text-sm text-white/80">{card.subtitle}</p>
                  </article>
                );
              })}
            </div>

            {/* Recent Bookings Table */}
            <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate2-900">Recent Bookings</h2>
                  <p className="text-sm text-slate2-500">Latest service bookings from customers</p>
                </div>
                <Link href="/admin/bookings" className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-600 hover:bg-brand-100">
                  View All
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate2-200 text-xs font-bold uppercase tracking-wider text-slate2-500">
                      <th className="px-4 py-3">Booking ID</th>
                      <th className="px-4 py-3">Service</th>
                      <th className="px-4 py-3">Sub-Service</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate2-100">
                    {metrics.recentBookings.map((booking) => (
                      <tr key={booking.id} className="text-sm">
                        <td className="px-4 py-4 font-mono text-xs font-semibold text-slate2-600">
                          #{booking.id.slice(-6)}
                        </td>
                        <td className="px-4 py-4 font-semibold text-slate2-800">
                          {booking.serviceName}
                        </td>
                        <td className="px-4 py-4 text-slate2-600">
                          {booking.subService}
                        </td>
                        <td className="px-4 py-4 font-semibold text-slate2-800">
                          {formatCurrency(booking.amount)}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                              booking.status === "completed"
                                ? "bg-emerald-100 text-emerald-700"
                                : booking.status === "confirmed"
                                ? "bg-brand-100 text-brand-700"
                                : booking.status === "pending"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate2-100 text-slate2-600"
                            }`}
                          >
                            {booking.status === "completed" && <CheckCircle2 className="h-3 w-3" />}
                            {booking.status === "confirmed" && <CalendarCheck2 className="h-3 w-3" />}
                            {booking.status === "pending" && <AlertCircle className="h-3 w-3" />}
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate2-600">
                          {new Date(booking.bookingDate).toLocaleDateString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {metrics.recentBookings.length === 0 && (
                  <div className="py-12 text-center">
                    <Briefcase className="mx-auto h-12 w-12 text-slate2-300" />
                    <p className="mt-3 text-sm font-semibold text-slate2-600">No bookings yet</p>
                    <p className="text-xs text-slate2-500">Bookings will appear here when customers place orders</p>
                  </div>
                )}
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              {/* Daily Bookings Chart */}
              <article className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm xl:col-span-2">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate2-900">Daily Bookings</h2>
                    <p className="text-sm text-slate2-500">Trend for last 14 days</p>
                  </div>
                  <span className="rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-600">Last 14 Days</span>
                </div>

                <div className="rounded-xl bg-slate2-50 p-4">
                  <svg viewBox="0 0 100 100" className="h-64 w-full">
                    <defs>
                      <linearGradient id="dashboardLine" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b88f" />
                        <stop offset="100%" stopColor="#0a9272" />
                      </linearGradient>
                    </defs>
                    <polyline
                      points={dailyPoints}
                      fill="none"
                      stroke="url(#dashboardLine)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="mt-2 grid grid-cols-7 gap-2 text-center text-[11px] font-bold text-slate2-500">
                    {metrics.dailyBookings.slice(-7).map((entry) => (
                      <span key={entry.date}>{entry.date}</span>
                    ))}
                  </div>
                </div>
              </article>

              {/* Monthly Earnings */}
              <article className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate2-900">Monthly Earnings</h2>
                    <p className="text-sm text-slate2-500">Current year revenue</p>
                  </div>
                  <span className="text-xl font-black text-brand-500">₹</span>
                </div>

                <div className="space-y-3">
                  {metrics.monthlyEarnings.slice(-6).map((month) => {
                    const width = Math.max((month.earnings / maxMonthly) * 100, 4);
                    return (
                      <div key={month.month} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-slate2-500">
                          <span>{month.month}</span>
                          <span>{formatCurrency(month.earnings)}</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-slate2-100">
                          <div
                            className="h-2.5 rounded-full bg-gradient-to-r from-brand-400 to-brand-500"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Link href="/admin/bookings" className="group rounded-2xl border border-slate2-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-brand-100 p-3 text-brand-600 transition group-hover:bg-brand-500 group-hover:text-white">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate2-900">Manage</p>
                    <p className="text-xs text-slate2-500">Bookings</p>
                  </div>
                </div>
              </Link>
              <Link href="/admin/workers" className="group rounded-2xl border border-slate2-200 bg-white p-5 shadow-sm transition hover:border-accent-300 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-accent-100 p-3 text-accent-600 transition group-hover:bg-accent-500 group-hover:text-white">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate2-900">Manage</p>
                    <p className="text-xs text-slate2-500">Workers</p>
                  </div>
                </div>
              </Link>
              <Link href="/admin/finance" className="group rounded-2xl border border-slate2-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600 transition group-hover:bg-emerald-500 group-hover:text-white">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate2-900">View</p>
                    <p className="text-xs text-slate2-500">Finance</p>
                  </div>
                </div>
              </Link>
              <Link href="/admin/settings" className="group rounded-2xl border border-slate2-200 bg-white p-5 shadow-sm transition hover:border-violet-300 hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-violet-100 p-3 text-violet-600 transition group-hover:bg-violet-500 group-hover:text-white">
                    <Settings className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate2-900">Configure</p>
                    <p className="text-xs text-slate2-500">Settings</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
