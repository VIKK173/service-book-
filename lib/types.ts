export type AdminMetricsResponse = {
  totals: {
    totalUsers: number;
    totalWorkers: number;
    totalBookings: number;
    completedOrders: number;
    pendingOrders: number;
    revenue: number;
  };
  dailyBookings: Array<{
    date: string;
    bookings: number;
  }>;
  monthlyEarnings: Array<{
    month: string;
    earnings: number;
  }>;
  recentBookings: Array<{
    id: string;
    amount: number;
    status: string;
    bookingDate: string;
  }>;
};

