import { redirect } from "next/navigation";
import {
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Phone,
  Shield,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  LogOut,
  Home,
} from "lucide-react";

import { getAuthenticatedWorker } from "@/lib/worker-auth";
import { connectToDatabase } from "@/lib/db";
import { WorkerModel } from "@/lib/models/Worker";
import { BookingModel } from "@/lib/models/Booking";

export const dynamic = "force-dynamic";

export default async function WorkerDashboardPage() {
  try {
    await connectToDatabase();
  } catch {
    return (
      <main className="min-h-screen bg-slate2-50 text-slate2-900 flex items-center justify-center p-6">
        <div className="w-full max-w-xl rounded-2xl border border-rose-200 bg-white p-8 shadow-lg">
          <h1 className="text-2xl font-black text-slate2-900">Worker Dashboard Unavailable</h1>
          <p className="mt-2 text-sm text-slate2-600">
            Database connection failed. Please check your connection.
          </p>
          <div className="mt-6">
            <a
              href="/worker/login"
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Back to Login
            </a>
          </div>
        </div>
      </main>
    );
  }

  const worker = await getAuthenticatedWorker();
  if (!worker) {
    redirect("/worker/login");
  }

  // Get worker details and bookings
  const workerDetails = await WorkerModel.findById(worker.id).lean();
  const bookings = await BookingModel.find({ 
    assignedWorkerId: worker.id 
  })
  .sort({ createdAt: -1 })
  .limit(10)
  .populate('userId', 'fullName email')
  .lean();

  if (!workerDetails) {
    redirect("/worker/login");
  }

  const stats = {
    totalBookings: bookings.length,
    completedBookings: bookings.filter(b => (b as any).status === 'completed').length,
    pendingBookings: bookings.filter(b => (b as any).status === 'pending' || (b as any).status === 'confirmed').length,
    totalEarnings: bookings
      .filter(b => (b as any).status === 'completed')
      .reduce((sum, b) => sum + (b as any).amount, 0),
  };

  return (
    <main className="min-h-screen bg-slate2-50 text-slate2-900">
      <div className="mx-auto flex min-h-screen max-w-[1400px]">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r border-slate2-200 bg-white px-6 py-8 lg:flex lg:flex-col">
          {/* Logo */}
          <div className="mb-10 flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 p-3 text-white shadow-lg shadow-brand-500/30">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black leading-none text-slate2-900">Worker Portal</p>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Dashboard</p>
            </div>
          </div>

          {/* Worker Info */}
          <div className="mb-8 rounded-2xl bg-slate2-50 p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-brand-100 flex items-center justify-center">
                <User className="h-6 w-6 text-brand-600" />
              </div>
              <div>
                <p className="font-bold text-slate2-900">{(workerDetails as any).fullName}</p>
                <p className="text-xs text-slate2-500">{(workerDetails as any).category}</p>
                <p className="text-xs text-slate2-500">{(workerDetails as any).city}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <div className="flex w-full items-center gap-3 rounded-xl bg-brand-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/30">
              <Home className="h-5 w-5" /> Dashboard
            </div>
          </nav>

          {/* Logout */}
          <div className="mt-auto">
            <a
              href="/api/worker/logout"
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate2-600 transition hover:bg-slate2-100"
            >
              <LogOut className="h-5 w-5" /> Logout
            </a>
          </div>
        </aside>

        {/* Main Content */}
        <section className="flex-1">
          {/* Header */}
          <header className="sticky top-0 z-10 border-b border-slate2-200 bg-white/95 px-6 py-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-slate2-900">Welcome back, {(workerDetails as any).fullName}!</h1>
                <p className="text-sm text-slate2-600">Manage your service bookings</p>
              </div>

              <div className="flex items-center gap-4">
                <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${
                  (workerDetails as any).dutyStatus === 'available' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : (workerDetails as any).dutyStatus === 'busy'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-slate2-100 text-slate2-600'
                }`}>
                  <div className={`h-2 w-2 rounded-full ${
                    (workerDetails as any).dutyStatus === 'available' 
                      ? 'bg-emerald-500' 
                      : (workerDetails as any).dutyStatus === 'busy'
                      ? 'bg-amber-500'
                      : 'bg-slate2-400'
                  }`} />
                  {(workerDetails as any).dutyStatus === 'available' ? 'Available' : 
                   (workerDetails as any).dutyStatus === 'busy' ? 'Busy' : 'Off Duty'}
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="space-y-6 p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate2-500">Total Bookings</p>
                    <p className="mt-2 text-3xl font-black text-slate2-900">{stats.totalBookings}</p>
                  </div>
                  <div className="rounded-xl bg-brand-100 p-3 text-brand-600">
                    <Calendar className="h-6 w-6" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate2-500">Completed</p>
                    <p className="mt-2 text-3xl font-black text-emerald-600">{stats.completedBookings}</p>
                  </div>
                  <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate2-500">Pending</p>
                    <p className="mt-2 text-3xl font-black text-amber-600">{stats.pendingBookings}</p>
                  </div>
                  <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate2-500">Total Earnings</p>
                    <p className="mt-2 text-3xl font-black text-brand-600">
                      ₹{stats.totalEarnings.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="rounded-xl bg-brand-100 p-3 text-brand-600">
                    <DollarSign className="h-6 w-6" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate2-900 mb-4">Recent Bookings</h2>
              
              {bookings.length === 0 ? (
                <div className="py-12 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-slate2-300" />
                  <p className="mt-3 text-sm font-semibold text-slate2-600">No bookings yet</p>
                  <p className="text-xs text-slate2-500">Your bookings will appear here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate2-200 text-xs font-bold uppercase tracking-wider text-slate2-500">
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Service</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate2-100">
                      {bookings.map((booking: any) => (
                        <tr key={booking._id} className="text-sm">
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-semibold text-slate2-800">{booking.userId?.fullName || 'Unknown'}</p>
                              <p className="text-xs text-slate2-500">{booking.userId?.email || ''}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-semibold text-slate2-800">{booking.serviceName}</p>
                              <p className="text-xs text-slate2-500">{booking.subService}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-slate2-600">
                            {new Date(booking.bookingDate).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-4 py-4 font-semibold text-slate2-800">
                            ₹{booking.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                                booking.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : booking.status === 'confirmed'
                                  ? 'bg-brand-100 text-brand-700'
                                  : booking.status === 'pending'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-slate2-100 text-slate2-600'
                              }`}
                            >
                              {booking.status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
                              {booking.status === 'confirmed' && <AlertCircle className="h-3 w-3" />}
                              {booking.status === 'pending' && <AlertCircle className="h-3 w-3" />}
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
