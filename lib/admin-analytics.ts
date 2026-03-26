import mongoose from "mongoose";

import { BookingModel } from "@/lib/models/Booking";
import { UserModel } from "@/lib/models/User";
import { WorkerModel } from "@/lib/models/Worker";

const DAY_MS = 24 * 60 * 60 * 1000;

type DailyBookings = {
  date: string;
  bookings: number;
};

type MonthlyEarnings = {
  month: string;
  earnings: number;
};

export type AdminAnalytics = {
  totals: {
    totalUsers: number;
    totalWorkers: number;
    totalBookings: number;
    completedOrders: number;
    pendingOrders: number;
    revenue: number;
  };
  dailyBookings: DailyBookings[];
  monthlyEarnings: MonthlyEarnings[];
  recentBookings: Array<{
    id: string;
    amount: number;
    status: string;
    bookingDate: string;
  }>;
};

function buildLastDays(days: number) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (days - 1 - index));
    return date;
  });
}

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const [
    totalUsers,
    totalWorkers,
    totalBookings,
    completedOrders,
    pendingOrders,
    revenueResult,
    dailyResult,
    monthlyResult,
    recentBookingsRaw,
  ] = await Promise.all([
    UserModel.countDocuments(),
    WorkerModel.countDocuments(),
    BookingModel.countDocuments(),
    BookingModel.countDocuments({ status: "completed" }),
    BookingModel.countDocuments({ status: { $in: ["pending", "confirmed", "in_progress"] } }),
    BookingModel.aggregate<{ total: number }>([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    BookingModel.aggregate<{ _id: Date; bookings: number }>([
      {
        $match: {
          bookingDate: {
            $gte: new Date(Date.now() - 13 * DAY_MS),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateTrunc: {
              date: "$bookingDate",
              unit: "day",
            },
          },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    BookingModel.aggregate<{ _id: Date; earnings: number }>([
      {
        $match: {
          status: "completed",
          bookingDate: {
            $gte: new Date(new Date().getFullYear(), 0, 1),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateTrunc: {
              date: "$bookingDate",
              unit: "month",
            },
          },
          earnings: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    BookingModel.find({}, { amount: 1, status: 1, bookingDate: 1 })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
  ]);

  const dailyMap = new Map(
    dailyResult.map((entry) => [new Date(entry._id).toISOString().slice(0, 10), entry.bookings]),
  );

  const dailyBookings = buildLastDays(14).map((date) => {
    const key = date.toISOString().slice(0, 10);

    return {
      date: key.slice(5),
      bookings: dailyMap.get(key) ?? 0,
    };
  });

  const currentYear = new Date().getFullYear();
  const monthlyMap = new Map(
    monthlyResult.map((entry) => [new Date(entry._id).getMonth(), entry.earnings]),
  );

  const monthlyEarnings = Array.from({ length: 12 }, (_, month) => {
    const label = new Date(currentYear, month, 1).toLocaleString("en-IN", { month: "short" });
    return {
      month: label,
      earnings: monthlyMap.get(month) ?? 0,
    };
  });

  return {
    totals: {
      totalUsers,
      totalWorkers,
      totalBookings,
      completedOrders,
      pendingOrders,
      revenue: revenueResult[0]?.total ?? 0,
    },
    dailyBookings,
    monthlyEarnings,
    recentBookings: recentBookingsRaw.map((booking) => ({
      id: String((booking as { _id: mongoose.Types.ObjectId })._id),
      amount: booking.amount,
      status: booking.status,
      bookingDate: new Date(booking.bookingDate).toISOString(),
    })),
  };
}

