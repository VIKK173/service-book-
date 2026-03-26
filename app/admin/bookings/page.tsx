"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Briefcase, CheckCircle2, Clock, Truck, Users,
  XCircle, ChevronDown, Loader2, Search, Shield, IndianRupee,
  RefreshCw, UserCheck,
} from "lucide-react";

type Booking = {
  _id: string;
  status: string;
  paymentStatus: string;
  amount: number;
  bookingDate: string | null;
  createdAt: string | null;
  notes: string;
  address: Record<string, string>;
  service: { name: string; category: string };
  worker: { _id: string; fullName: string; phone: string } | null;
};

type Worker = {
  _id: string;
  fullName: string;
  category: string;
  city: string;
  rating: number;
  isAvailable: boolean;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-blue-100 text-blue-700",
  on_the_way: "bg-purple-100 text-purple-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
  confirmed: "bg-cyan-100 text-cyan-700",
  in_progress: "bg-indigo-100 text-indigo-700",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  accepted: <CheckCircle2 className="h-3 w-3" />,
  on_the_way: <Truck className="h-3 w-3" />,
  completed: <CheckCircle2 className="h-3 w-3" />,
  cancelled: <XCircle className="h-3 w-3" />,
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  async function load() {
    setLoading(true);
    try {
      const [bRes, wRes] = await Promise.all([
        fetch("/api/admin/bookings"),
        fetch("/api/admin/workers"),
      ]);
      const bData = await bRes.json();
      const wData = await wRes.json();
      setBookings(bData.bookings ?? []);
      setWorkers(wData.workers ?? []);
    } catch {
      showToast("Failed to load data", false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function assignWorker(bookingId: string) {
    const workerId = selectedWorker[bookingId];
    if (!workerId) return showToast("Select a worker first", false);
    setAssigning(bookingId);
    try {
      const res = await fetch("/api/admin/bookings/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, workerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(data.message);
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Assignment failed", false);
    } finally {
      setAssigning(null);
    }
  }

  const filtered = bookings.filter((b) => {
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      b.service.name.toLowerCase().includes(q) ||
      b.service.category.toLowerCase().includes(q) ||
      b.worker?.fullName.toLowerCase().includes(q) ||
      b.status.includes(q);
    return matchStatus && matchSearch;
  });

  const unassigned = bookings.filter((b) => !b.worker && b.status === "pending").length;

  return (
    <main className="min-h-screen bg-slate-100">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-xl ${
            toast.ok ? "bg-slate-900" : "bg-rose-600"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 p-2 text-white">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900">Booking Management</h1>
                <p className="text-xs text-slate-500">Assign workers · Track status</p>
              </div>
            </div>

            {unassigned > 0 && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
                ⚠️ {unassigned} unassigned booking{unassigned !== 1 ? "s" : ""}
              </span>
            )}

            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={load}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 focus-within:border-indigo-400 focus-within:bg-white">
              <Search className="h-4 w-4" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search bookings..."
                className="bg-transparent outline-none"
              />
            </label>

            {["all", "pending", "accepted", "on_the_way", "completed", "cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  statusFilter === s
                    ? "bg-indigo-600 text-white shadow"
                    : "bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                {s === "all" ? "All" : s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                <span className="ml-1 opacity-70">
                  ({s === "all" ? bookings.length : bookings.filter((b) => b.status === s).length})
                </span>
              </button>
            ))}
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white py-24">
              <Briefcase className="mb-4 h-12 w-12 text-slate-300" />
              <p className="text-lg font-bold text-slate-400">No bookings found</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.12em] text-slate-500">Service</th>
                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.12em] text-slate-500">Status</th>
                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.12em] text-slate-500">Amount</th>
                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.12em] text-slate-500">Date</th>
                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.12em] text-slate-500">Assigned Worker</th>
                    <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-[0.12em] text-slate-500">Assign</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((booking) => {
                    const statusCls = STATUS_COLORS[booking.status] ?? "bg-slate-100 text-slate-600";
                    const icon = STATUS_ICONS[booking.status];
                    const compatibleWorkers = workers.filter(
                      (w) => w.category.toLowerCase() === booking.service.category?.toLowerCase() || true
                    );

                    return (
                      <tr key={booking._id} className="hover:bg-slate-50/60 transition">
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900">{booking.service.name}</p>
                          <p className="text-xs text-slate-500">{booking.service.category}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${statusCls}`}
                          >
                            {icon}
                            {booking.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1 font-bold text-emerald-700">
                            <IndianRupee className="h-3.5 w-3.5" />
                            {booking.amount.toLocaleString("en-IN")}
                          </span>
                          <span
                            className={`text-xs font-semibold ${
                              booking.paymentStatus === "paid" ? "text-emerald-600" : "text-amber-600"
                            }`}
                          >
                            {booking.paymentStatus}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {booking.bookingDate
                            ? new Date(booking.bookingDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </td>
                        <td className="px-5 py-4">
                          {booking.worker ? (
                            <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                              <UserCheck className="h-4 w-4 text-emerald-500" />
                              {booking.worker.fullName}
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-rose-500">Unassigned</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <select
                              value={selectedWorker[booking._id] ?? ""}
                              onChange={(e) =>
                                setSelectedWorker((prev) => ({
                                  ...prev,
                                  [booking._id]: e.target.value,
                                }))
                              }
                              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400"
                            >
                              <option value="">Select worker...</option>
                              {workers.map((w) => (
                                <option key={w._id} value={w._id}>
                                  {w.fullName} ({w.category})
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => assignWorker(booking._id)}
                              disabled={assigning === booking._id || !selectedWorker[booking._id]}
                              className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-black text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {assigning === booking._id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                "Assign"
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
