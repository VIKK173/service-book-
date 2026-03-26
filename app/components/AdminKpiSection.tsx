"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, CalendarDays, IndianRupee, Users, UserCog, Briefcase, LoaderCircle } from "lucide-react";

import type { AdminMetricsResponse } from "@/lib/types";

type Props = {
  initialData?: AdminMetricsResponse;
  mode?: "home" | "dashboard";
};

const cardStyles = [
  "from-cyan-500 to-blue-500",
  "from-violet-500 to-indigo-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-fuchsia-500 to-purple-500",
] as const;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function statusLabel(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function DailyBookingsChart({ data }: { data: AdminMetricsResponse["dailyBookings"] }) {
  const points = useMemo(() => {
    if (!data.length) {
      return "";
    }

    const maxValue = Math.max(...data.map((entry) => entry.bookings), 1);

    return data
      .map((entry, index) => {
        const x = (index / Math.max(data.length - 1, 1)) * 100;
        const y = 100 - (entry.bookings / maxValue) * 90;
        return `${x},${y}`;
      })
      .join(" ");
  }, [data]);

  return (
    <div className="rounded-2xl border border-white/30 bg-white p-5 shadow-xl shadow-slate-200/40">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-slate-900">Daily Bookings</h3>
        <Activity className="h-4 w-4 text-cyan-600" />
      </div>
      <div className="relative h-44 rounded-xl bg-gradient-to-b from-cyan-50 to-white p-4">
        <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
          <polyline
            fill="none"
            stroke="url(#dailyGradient)"
            strokeWidth="2.6"
            points={points}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="dailyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1 text-[10px] font-semibold text-slate-500">
        {data.slice(-7).map((entry) => (
          <span key={entry.date} className="truncate text-center">
            {entry.date}
          </span>
        ))}
      </div>
    </div>
  );
}

function MonthlyEarningsChart({ data }: { data: AdminMetricsResponse["monthlyEarnings"] }) {
  const maxValue = Math.max(...data.map((entry) => entry.earnings), 1);

  return (
    <div className="rounded-2xl border border-white/30 bg-white p-5 shadow-xl shadow-slate-200/40">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-slate-900">Monthly Earnings</h3>
        <IndianRupee className="h-4 w-4 text-emerald-600" />
      </div>
      <div className="grid h-44 grid-cols-12 items-end gap-2 rounded-xl bg-gradient-to-b from-emerald-50 to-white p-4">
        {data.map((entry) => {
          const height = Math.max((entry.earnings / maxValue) * 100, 4);

          return (
            <div key={entry.month} className="flex h-full flex-col items-center justify-end gap-1">
              <div
                className="w-full rounded-md bg-gradient-to-t from-emerald-600 to-teal-400"
                style={{ height: `${height}%` }}
                title={`${entry.month}: ${formatCurrency(entry.earnings)}`}
              />
              <span className="text-[10px] font-semibold text-slate-500">{entry.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AdminKpiSection({ initialData, mode = "home" }: Props) {
  const [data, setData] = useState<AdminMetricsResponse | null>(initialData ?? null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      return;
    }

    const controller = new AbortController();

    async function fetchMetrics() {
      try {
        setLoading(true);
        const endpoint = mode === "dashboard" ? "/api/admin/metrics" : "/api/stats";
        const response = await fetch(endpoint, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load metrics");
        }

        const json = (await response.json()) as AdminMetricsResponse;
        setData(json);
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }

        setError(fetchError instanceof Error ? fetchError.message : "Failed to load metrics");
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();

    return () => {
      controller.abort();
    };
  }, [initialData]);

  if (loading && !data) {
    return (
      <section className="rounded-[2rem] border border-white/30 bg-white/80 p-8 shadow-2xl shadow-slate-200/50 backdrop-blur">
        <div className="flex items-center gap-3 text-slate-600">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          Loading admin insights...
        </div>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="rounded-[2rem] border border-rose-100 bg-rose-50 p-8 text-rose-700">
        Failed to load admin analytics. {error ? `(${error})` : ""}
      </section>
    );
  }

  const cards = [
    { title: "Total Users", value: data.totals.totalUsers, icon: Users },
    { title: "Total Workers", value: data.totals.totalWorkers, icon: UserCog },
    { title: "Total Bookings", value: data.totals.totalBookings, icon: Briefcase },
    { title: "Completed Orders", value: data.totals.completedOrders, icon: CalendarDays },
    { title: "Pending Orders", value: data.totals.pendingOrders, icon: Activity },
    { title: "Revenue", value: formatCurrency(data.totals.revenue), icon: IndianRupee },
  ];

  return (
    <section className="rounded-[2rem] border border-white/50 bg-gradient-to-br from-slate-50 to-cyan-50 p-6 shadow-2xl shadow-slate-200/60 md:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">Control Center</p>
          <h2 className="font-display text-3xl font-bold text-slate-900">
            {mode === "dashboard" ? "Admin Analytics" : "Live Platform Analytics"}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <article
              key={card.title}
              className="relative overflow-hidden rounded-2xl border border-white/50 bg-white p-5 shadow-lg shadow-slate-200/40"
            >
              <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${cardStyles[index]}`} />
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-500">{card.title}</p>
                <span className="rounded-lg bg-slate-100 p-2 text-slate-700">
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="font-display text-3xl font-bold text-slate-900">{card.value}</p>
            </article>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <DailyBookingsChart data={data.dailyBookings} />
        <MonthlyEarningsChart data={data.monthlyEarnings} />
      </div>

      {mode === "dashboard" && data.recentBookings.length > 0 ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-100/80">
          <h3 className="mb-4 font-display text-lg font-semibold text-slate-900">Recent Bookings</h3>
          <div className="space-y-3">
            {data.recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-mono text-xs text-slate-500">#{booking.id.slice(-6)}</span>
                <span className="font-semibold text-slate-700">{new Date(booking.bookingDate).toLocaleDateString("en-IN")}</span>
                <span className="font-semibold text-slate-900">{formatCurrency(booking.amount)}</span>
                <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-bold text-cyan-700">
                  {statusLabel(booking.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}



