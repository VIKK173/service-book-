"use client";

import { useDeferredValue, useEffect, useEffectEvent, useState, startTransition } from "react";
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Download,
  IndianRupee,
  Landmark,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Search,
  Settings,
  ShoppingBag,
  Star,
  TrendingUp,
  TriangleAlert,
  Users,
  Wallet,
  X,
} from "lucide-react";

import { AdminLogoutButton } from "@/app/components/AdminLogoutButton";
import type {
  AdminDashboardData,
  DashboardPaymentMethod,
  DashboardPaymentStatus,
  WorkerDutyStatus,
} from "@/lib/admin-dashboard";

type AdminIdentity = {
  fullName: string;
  email: string;
  role: string;
};

type AdminSection =
  | "overview"
  | "bookings"
  | "payments"
  | "feedback"
  | "sales"
  | "workers"
  | "notifications"
  | "settings";

type NotificationType = "booking" | "payment" | "alert" | "warning";

type DashboardNotification = {
  id: string;
  type: NotificationType;
  title: string;
  subtitle: string;
  createdAt: string;
  read: boolean;
};

type Props = {
  admin: AdminIdentity;
  initialData: AdminDashboardData;
};

const BOOKING_STATUS_STYLES: Record<string, string> = {
  pending: "bg-orange-100 text-orange-700",
  confirmed: "bg-blue-100 text-blue-700",
  accepted: "bg-blue-100 text-blue-700",
  in_progress: "bg-purple-100 text-purple-700",
  on_the_way: "bg-purple-100 text-purple-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
};

const PAYMENT_STATUS_STYLES: Record<DashboardPaymentStatus, string> = {
  paid: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-rose-100 text-rose-700",
  refunded: "bg-slate-200 text-slate-700",
};

const DUTY_STATUS_STYLES: Record<WorkerDutyStatus, string> = {
  available: "bg-emerald-100 text-emerald-700",
  busy: "bg-orange-100 text-orange-700",
  off_duty: "bg-slate-200 text-slate-600",
};

const PAYMENT_METHOD_LABELS: Record<DashboardPaymentMethod, string> = {
  upi: "UPI",
  card: "Card",
  cash: "COD",
  netbanking: "Net Banking",
};

const NOTIFICATION_DOT: Record<NotificationType, string> = {
  booking: "bg-emerald-500",
  payment: "bg-blue-500",
  alert: "bg-rose-500",
  warning: "bg-orange-500",
};

const CATEGORY_ORDER = ["cleaning", "ac", "furniture", "painting", "salon", "plumbing"] as const;

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

function formatLabel(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatClock(date: Date) {
  const weekday = date.toLocaleDateString("en-IN", { weekday: "long" });
  const day = date.toLocaleDateString("en-IN", { day: "2-digit" });
  const month = date.toLocaleDateString("en-IN", { month: "short" });
  const year = date.toLocaleDateString("en-IN", { year: "numeric" });
  const time = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return `${weekday}, ${day} ${month} ${year} - ${time}`;
}

function formatTimeAgo(value: string, now: Date) {
  const diffMinutes = Math.max(0, Math.floor((now.getTime() - new Date(value).getTime()) / 60000));

  if (diffMinutes < 1) {
    return "just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} mins ago`;
  }

  return `${Math.floor(diffMinutes / 60)} hrs ago`;
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function isSameDay(value: string | null, date: Date) {
  if (!value) {
    return false;
  }

  const next = new Date(value);
  return (
    next.getFullYear() === date.getFullYear() &&
    next.getMonth() === date.getMonth() &&
    next.getDate() === date.getDate()
  );
}

function isWithinRange(value: string, from: Date, to: Date) {
  const time = new Date(value).getTime();
  return time >= from.getTime() && time <= to.getTime();
}

function paymentMethodIcon(method: DashboardPaymentMethod) {
  if (method === "upi") {
    return <Wallet className="h-4 w-4" />;
  }

  if (method === "card") {
    return <CreditCard className="h-4 w-4" />;
  }

  if (method === "netbanking") {
    return <Landmark className="h-4 w-4" />;
  }

  return <IndianRupee className="h-4 w-4" />;
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function buildSeedNotifications(data: AdminDashboardData) {
  const items: DashboardNotification[] = [];
  const firstBooking = data.bookings[0];
  const firstPayment = data.payments.find((payment) => payment.status === "paid");
  const firstLowReview = data.feedbacks.find((feedback) => Math.min(feedback.serviceStars, feedback.workerStars) <= 2);
  const firstUnassigned = data.bookings.find((booking) => booking.workerName === "Unassigned");

  if (firstBooking) {
    items.push({
      id: `booking-${firstBooking.id}`,
      type: "booking",
      title: "New booking received",
      subtitle: `${firstBooking.bookingCode} - ${firstBooking.serviceName}`,
      createdAt: firstBooking.createdAt,
      read: false,
    });
  }

  if (firstPayment) {
    items.push({
      id: `payment-${firstPayment.id}`,
      type: "payment",
      title: "Payment received",
      subtitle: `${formatCurrency(firstPayment.amount)} via ${PAYMENT_METHOD_LABELS[firstPayment.method]}`,
      createdAt: firstPayment.dateTime,
      read: false,
    });
  }

  if (firstLowReview) {
    items.push({
      id: `review-${firstLowReview.id}`,
      type: "alert",
      title: "Low rating alert",
      subtitle: `${Math.min(firstLowReview.serviceStars, firstLowReview.workerStars)}-star review received`,
      createdAt: firstLowReview.createdAt,
      read: false,
    });
  }

  if (firstUnassigned) {
    items.push({
      id: `warning-${firstUnassigned.id}`,
      type: "warning",
      title: "Worker unassigned",
      subtitle: `Booking ${firstUnassigned.bookingCode} has no worker`,
      createdAt: firstUnassigned.createdAt,
      read: false,
    });
  }

  return items;
}

function getSalesRangeBounds(range: string, now: Date, customFrom: string, customTo: string) {
  if (range === "today") {
    return { from: startOfDay(now), to: endOfDay(now) };
  }

  if (range === "week") {
    const from = startOfDay(now);
    from.setDate(now.getDate() - now.getDay());
    return { from, to: endOfDay(now) };
  }

  if (range === "month") {
    return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: endOfDay(now) };
  }

  if (range === "quarter") {
    const from = new Date(now);
    from.setMonth(now.getMonth() - 3);
    return { from: startOfDay(from), to: endOfDay(now) };
  }

  return {
    from: customFrom ? startOfDay(new Date(customFrom)) : new Date(0),
    to: customTo ? endOfDay(new Date(customTo)) : endOfDay(now),
  };
}

function performanceBarClass(value: number) {
  if (value >= 80) {
    return "bg-emerald-500";
  }

  if (value >= 50) {
    return "bg-orange-500";
  }

  return "bg-rose-500";
}

export default function AdminDashboardClient({ admin, initialData }: Props) {
  const [data, setData] = useState(initialData);
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [now, setNow] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState<{ message: string; ok: boolean } | null>(null);
  const [notifications, setNotifications] = useState<DashboardNotification[]>(() => buildSeedNotifications(initialData));
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingFilter, setBookingFilter] = useState("all");
  const [bookingSort, setBookingSort] = useState("date");
  const [bookingPage, setBookingPage] = useState(1);
  const [assignSelections, setAssignSelections] = useState<Record<string, string>>({});
  const [paymentSearch, setPaymentSearch] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [paymentRange, setPaymentRange] = useState("month");
  const [feedbackSearch, setFeedbackSearch] = useState("");
  const [feedbackFilter, setFeedbackFilter] = useState("all");
  const [feedbackSort, setFeedbackSort] = useState("newest");
  const [expandedFeedback, setExpandedFeedback] = useState<Record<string, boolean>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [salesRange, setSalesRange] = useState("month");
  const [salesFrom, setSalesFrom] = useState("");
  const [salesTo, setSalesTo] = useState("");
  const [expandedWorkers, setExpandedWorkers] = useState<Record<string, boolean>>({});
  const [workerModalOpen, setWorkerModalOpen] = useState(false);
  const [newWorker, setNewWorker] = useState({
    name: "",
    phone: "",
    specialization: "",
    city: "",
  });

  const deferredBookingSearch = useDeferredValue(bookingSearch);
  const deferredPaymentSearch = useDeferredValue(paymentSearch);
  const deferredFeedbackSearch = useDeferredValue(feedbackSearch);

  const showToast = useEffectEvent((message: string, ok = true) => {
    setToast({ message, ok });
    window.setTimeout(() => setToast(null), 3000);
  });

  const refreshData = useEffectEvent(async (silent = true) => {
    try {
      setIsRefreshing(true);
      const response = await fetch("/api/admin/dashboard", { cache: "no-store" });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to refresh dashboard");
      }

      startTransition(() => {
        setData(result);
      });
    } catch (error) {
      if (!silent) {
        showToast(error instanceof Error ? error.message : "Failed to refresh dashboard", false);
      }
    } finally {
      setIsRefreshing(false);
    }
  });

  const pushRandomNotification = useEffectEvent(() => {
    const booking = data.bookings[Math.floor(Math.random() * Math.max(data.bookings.length, 1))];
    const payment = data.payments[Math.floor(Math.random() * Math.max(data.payments.length, 1))];
    const feedback = data.feedbacks[Math.floor(Math.random() * Math.max(data.feedbacks.length, 1))];
    const templates: DashboardNotification[] = [];

    if (booking) {
      templates.push({
        id: `booking-live-${Date.now()}`,
        type: "booking",
        title: "New booking received",
        subtitle: `${booking.bookingCode} - ${booking.serviceName}`,
        createdAt: new Date().toISOString(),
        read: false,
      });

      templates.push({
        id: `warning-live-${Date.now() + 1}`,
        type: "warning",
        title: "Worker unassigned",
        subtitle: `Booking ${booking.bookingCode} has no worker`,
        createdAt: new Date().toISOString(),
        read: false,
      });
    }

    if (payment) {
      templates.push({
        id: `payment-live-${Date.now() + 2}`,
        type: "payment",
        title: "Payment received",
        subtitle: `${formatCurrency(payment.amount)} via ${PAYMENT_METHOD_LABELS[payment.method]}`,
        createdAt: new Date().toISOString(),
        read: false,
      });
    }

    if (feedback) {
      templates.push({
        id: `review-live-${Date.now() + 3}`,
        type: "alert",
        title: "Low rating alert",
        subtitle: `${Math.min(feedback.serviceStars, feedback.workerStars)}-star review received`,
        createdAt: new Date().toISOString(),
        read: false,
      });
    }

    if (templates.length > 0) {
      const item = templates[Math.floor(Math.random() * templates.length)];
      setNotifications((current) => [item, ...current].slice(0, 20));
    }
  });

  useEffect(() => {
    const syncHash = () => {
      const value = window.location.hash.replace("#", "");
      if (
        value === "overview" ||
        value === "bookings" ||
        value === "payments" ||
        value === "feedback" ||
        value === "sales" ||
        value === "workers" ||
        value === "notifications" ||
        value === "settings"
      ) {
        setActiveSection(value);
      }
    };

    syncHash();
    window.addEventListener("hashchange", syncHash);

    const clockTimer = window.setInterval(() => setNow(new Date()), 1000);
    const refreshTimer = window.setInterval(() => refreshData(true), 30000);
    const notificationTimer = window.setInterval(() => pushRandomNotification(), 45000);

    return () => {
      window.removeEventListener("hashchange", syncHash);
      window.clearInterval(clockTimer);
      window.clearInterval(refreshTimer);
      window.clearInterval(notificationTimer);
    };
  }, [pushRandomNotification, refreshData]);

  useEffect(() => {
    setBookingPage(1);
  }, [deferredBookingSearch, bookingFilter, bookingSort]);

  const today = startOfDay(now);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - now.getDay());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalRevenue = data.bookings
    .filter((booking) => ["confirmed", "in_progress", "completed"].includes(booking.status))
    .reduce((sum, booking) => sum + booking.amount, 0);
  const todayRevenue = data.bookings
    .filter(
      (booking) =>
        ["confirmed", "in_progress", "completed"].includes(booking.status) && isSameDay(booking.bookingDate, now),
    )
    .reduce((sum, booking) => sum + booking.amount, 0);
  const yesterdayRevenue = data.bookings
    .filter((booking) => {
      const value = new Date(booking.bookingDate);
      return (
        ["confirmed", "in_progress", "completed"].includes(booking.status) &&
        value.getFullYear() === yesterday.getFullYear() &&
        value.getMonth() === yesterday.getMonth() &&
        value.getDate() === yesterday.getDate()
      );
    })
    .reduce((sum, booking) => sum + booking.amount, 0);
  const pendingServices = data.bookings.filter((booking) => ["pending", "confirmed"].includes(booking.status)).length;
  const completedToday = data.bookings.filter((booking) => booking.status === "completed" && isSameDay(booking.completedAt, now)).length;
  const completedThisWeek = data.bookings.filter(
    (booking) => booking.completedAt && booking.status === "completed" && isWithinRange(booking.completedAt, weekStart, endOfDay(now)),
  ).length;
  const activeWorkers = new Set(
    data.bookings
      .filter((booking) => booking.workerId && ["pending", "confirmed", "in_progress"].includes(booking.status))
      .map((booking) => booking.workerId),
  ).size;
  const avgRating = average(data.feedbacks.flatMap((feedback) => [feedback.serviceStars, feedback.workerStars]));
  const newToday = data.bookings.filter((booking) => isSameDay(booking.createdAt, now)).length;
  const pendingPayments = data.payments.filter((payment) => payment.status === "pending");
  const unreadReviews = data.feedbacks.filter((feedback) => !feedback.adminReply).length;
  const unreadNotifications = notifications.filter((notification) => !notification.read).length;

  const bookingsFiltered = [...data.bookings]
    .filter((booking) => {
      const query = deferredBookingSearch.trim().toLowerCase();
      const matchesSearch =
        !query ||
        booking.customerName.toLowerCase().includes(query) ||
        booking.customerEmail.toLowerCase().includes(query) ||
        booking.serviceName.toLowerCase().includes(query) ||
        booking.bookingCode.toLowerCase().includes(query);
      const matchesFilter = bookingFilter === "all" || booking.status === bookingFilter;
      return matchesSearch && matchesFilter;
    })
    .sort((left, right) => {
      if (bookingSort === "amount") {
        return right.amount - left.amount;
      }
      if (bookingSort === "status") {
        return left.status.localeCompare(right.status);
      }
      return new Date(right.bookingDate).getTime() - new Date(left.bookingDate).getTime();
    });

  const totalBookingPages = Math.max(1, Math.ceil(bookingsFiltered.length / 10));
  const paginatedBookings = bookingsFiltered.slice((bookingPage - 1) * 10, bookingPage * 10);

  const paymentsFiltered = [...data.payments]
    .filter((payment) => {
      const query = deferredPaymentSearch.trim().toLowerCase();
      const matchesSearch =
        !query ||
        payment.transactionId.toLowerCase().includes(query) ||
        payment.customerName.toLowerCase().includes(query);
      const matchesMethod = paymentMethodFilter === "all" || payment.method === paymentMethodFilter;
      const matchesStatus = paymentStatusFilter === "all" || payment.status === paymentStatusFilter;
      let matchesRange = true;
      if (paymentRange === "today") {
        matchesRange = isSameDay(payment.dateTime, now);
      } else if (paymentRange === "week") {
        matchesRange = isWithinRange(payment.dateTime, weekStart, endOfDay(now));
      } else if (paymentRange === "month") {
        matchesRange = isWithinRange(payment.dateTime, monthStart, endOfDay(now));
      }
      return matchesSearch && matchesMethod && matchesStatus && matchesRange;
    })
    .sort((left, right) => new Date(right.dateTime).getTime() - new Date(left.dateTime).getTime());

  const filteredPaymentRevenue = paymentsFiltered
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const monthPaymentRevenue = data.payments
    .filter((payment) => payment.status === "paid" && isWithinRange(payment.dateTime, monthStart, endOfDay(now)))
    .reduce((sum, payment) => sum + payment.amount, 0);
  const paymentMethodSummary = (["upi", "card", "cash", "netbanking"] as DashboardPaymentMethod[]).map((method) => {
    const items = data.payments.filter((payment) => payment.method === method);
    return {
      method,
      count: items.length,
      total: items.reduce((sum, payment) => sum + payment.amount, 0),
    };
  });

  const revenueBars = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const from = startOfDay(date);
    const to = endOfDay(date);
    const amount = data.payments
      .filter((payment) => payment.status === "paid" && isWithinRange(payment.dateTime, from, to))
      .reduce((sum, payment) => sum + payment.amount, 0);
    return { label: date.toLocaleDateString("en-IN", { weekday: "short" }), amount };
  });
  const maxRevenueBar = Math.max(...revenueBars.map((entry) => entry.amount), 1);

  const feedbackFiltered = [...data.feedbacks]
    .filter((feedback) => {
      const query = deferredFeedbackSearch.trim().toLowerCase();
      const minRating = Math.min(feedback.serviceStars, feedback.workerStars);
      const matchesSearch =
        !query ||
        feedback.customerName.toLowerCase().includes(query) ||
        feedback.serviceName.toLowerCase().includes(query);
      const matchesFilter =
        feedbackFilter === "all" ||
        (feedbackFilter === "5-star" && minRating === 5) ||
        (feedbackFilter === "4-star" && minRating === 4) ||
        (feedbackFilter === "3-star" && minRating === 3) ||
        (feedbackFilter === "low" && minRating <= 2);
      return matchesSearch && matchesFilter;
    })
    .sort((left, right) => {
      if (feedbackSort === "oldest") {
        return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
      }
      if (feedbackSort === "highest") {
        return Math.max(right.serviceStars, right.workerStars) - Math.max(left.serviceStars, left.workerStars);
      }
      if (feedbackSort === "lowest") {
        return Math.min(left.serviceStars, left.workerStars) - Math.min(right.serviceStars, right.workerStars);
      }
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });

  const salesBounds = getSalesRangeBounds(salesRange, now, salesFrom, salesTo);
  const salesRows = data.bookings.filter((booking) => isWithinRange(booking.bookingDate, salesBounds.from, salesBounds.to));
  const salesValid = salesRows.filter((booking) => booking.status !== "cancelled");
  const salesRevenue = salesValid.reduce((sum, booking) => sum + booking.amount, 0);
  const averageOrderValue = salesValid.length > 0 ? salesRevenue / salesValid.length : 0;
  const popularService = Object.entries(
    salesValid.reduce<Record<string, number>>((accumulator, booking) => {
      accumulator[booking.serviceName] = (accumulator[booking.serviceName] ?? 0) + 1;
      return accumulator;
    }, {}),
  ).sort((left, right) => right[1] - left[1])[0];
  const activeWorker = Object.entries(
    salesValid.reduce<Record<string, number>>((accumulator, booking) => {
      if (booking.workerName !== "Unassigned") {
        accumulator[booking.workerName] = (accumulator[booking.workerName] ?? 0) + 1;
      }
      return accumulator;
    }, {}),
  ).sort((left, right) => right[1] - left[1])[0];
  const peakHour = Object.entries(
    salesValid.reduce<Record<string, number>>((accumulator, booking) => {
      const hour = new Date(booking.bookingDate).getHours();
      const label = `${hour % 12 || 12}:00 ${hour < 12 ? "AM" : "PM"} - ${(hour + 1) % 12 || 12}:00 ${
        hour + 1 < 12 || hour + 1 === 24 ? "AM" : "PM"
      }`;
      accumulator[label] = (accumulator[label] ?? 0) + 1;
      return accumulator;
    }, {}),
  ).sort((left, right) => right[1] - left[1])[0];
  const cancellationRate = salesRows.length > 0 ? (salesRows.filter((booking) => booking.status === "cancelled").length / salesRows.length) * 100 : 0;
  const categoryBreakdown = CATEGORY_ORDER.map((category) => {
    const items = salesValid.filter((booking) => booking.serviceCategory === category);
    const revenue = items.reduce((sum, booking) => sum + booking.amount, 0);
    const share = salesRevenue > 0 ? (revenue / salesRevenue) * 100 : 0;
    return { category, count: items.length, revenue, share };
  });

  const workersView = data.workers.map((worker) => {
    const relatedBookings = data.bookings.filter((booking) => booking.workerId === worker.id);
    const jobsToday = relatedBookings.filter((booking) => isSameDay(booking.bookingDate, now)).length;
    const jobsThisMonth = relatedBookings.filter((booking) => isWithinRange(booking.bookingDate, monthStart, endOfDay(now))).length;
    const earningsThisMonth = relatedBookings
      .filter((booking) => isWithinRange(booking.bookingDate, monthStart, endOfDay(now)) && booking.status !== "cancelled")
      .reduce((sum, booking) => sum + booking.amount, 0);
    const performance = Math.min(100, (jobsThisMonth / 20) * 100);
    return { ...worker, jobsToday, jobsThisMonth, earningsThisMonth, performance };
  });

  const navItems = [
    { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard, badge: null },
    { id: "bookings", label: "Bookings", icon: ShoppingBag, badge: pendingServices },
    { id: "payments", label: "Payments", icon: CreditCard, badge: pendingPayments.length },
    { id: "feedback", label: "Feedback", icon: MessageSquare, badge: unreadReviews },
    { id: "sales", label: "Sales History", icon: TrendingUp, badge: null },
    { id: "workers", label: "Workers", icon: Users, badge: null },
    { id: "notifications", label: "Notifications", icon: Bell, badge: unreadNotifications },
    { id: "settings", label: "Settings", icon: Settings, badge: null },
  ] as const;

  async function runMutation(url: string, payload: Record<string, string>, successText: string) {
    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error ?? "Request failed");
      }
      showToast(result.message ?? successText);
      await refreshData(true);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Action failed", false);
    }
  }

  async function assignWorker(bookingId: string) {
    const workerId = assignSelections[bookingId];
    if (!workerId) {
      showToast("Select a worker first", false);
      return;
    }

    try {
      const response = await fetch("/api/admin/bookings/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, workerId }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error ?? "Assignment failed");
      }
      showToast(result.message ?? "Worker assigned");
      await refreshData(true);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Assignment failed", false);
    }
  }

  async function addWorker() {
    try {
      const response = await fetch("/api/admin/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWorker),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error ?? "Failed to add worker");
      }
      showToast(result.message ?? "Worker added");
      setWorkerModalOpen(false);
      setNewWorker({ name: "", phone: "", specialization: "", city: "" });
      await refreshData(true);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to add worker", false);
    }
  }

  function setSection(section: AdminSection) {
    setActiveSection(section);
    window.location.hash = section;
  }

  function exportBookingsCsv() {
    downloadCsv("servicehub-bookings.csv", [
      [
        "Booking ID",
        "Customer Name",
        "Customer Email",
        "Service Name",
        "Sub-Service",
        "Worker Assigned",
        "Date & Time",
        "Amount",
        "Payment Method",
        "Status",
      ],
      ...data.bookings.map((booking) => [
        booking.bookingCode,
        booking.customerName,
        booking.customerEmail,
        booking.serviceName,
        booking.subService,
        booking.workerName,
        formatDateTime(booking.bookingDate),
        String(booking.amount),
        PAYMENT_METHOD_LABELS[booking.paymentMethod],
        formatLabel(booking.status),
      ]),
    ]);
    showToast("Bookings CSV downloaded");
  }

  function exportSalesReport() {
    downloadCsv("servicehub-sales-report.csv", [
      ["Date", "Booking ID", "Service", "Customer", "Worker", "Amount", "Payment Mode", "Status"],
      ...salesRows.map((booking) => [
        formatDateTime(booking.bookingDate),
        booking.bookingCode,
        booking.serviceName,
        booking.customerName,
        booking.workerName,
        String(booking.amount),
        PAYMENT_METHOD_LABELS[booking.paymentMethod],
        formatLabel(booking.status),
      ]),
      ["Total", "", "", "", "", String(salesRevenue), "", ""],
    ]);
    showToast("Sales report downloaded");
  }

  function renderStars(value: number, keyPrefix: string) {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, index) => index + 1).map((star) => (
          <Star
            key={`${keyPrefix}-${star}`}
            className={`h-4 w-4 ${star <= value ? "fill-amber-400 text-amber-400" : "text-slate2-300"}`}
          />
        ))}
      </div>
    );
  }

  function renderOverview() {
    return (
      <section className="space-y-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {[
            {
              label: "Total Revenue",
              value: formatCurrency(totalRevenue),
              sub: `+${formatCurrency(todayRevenue)} today`,
              icon: IndianRupee,
              iconClass: "text-emerald-600",
              trend: todayRevenue > yesterdayRevenue ? "text-emerald-600" : "text-slate2-400",
              mark: todayRevenue > yesterdayRevenue ? "↗" : "→",
            },
            {
              label: "Total Bookings",
              value: formatCount(data.bookings.length),
              sub: `${newToday} new today`,
              icon: ShoppingBag,
              iconClass: "text-blue-600",
            },
            {
              label: "Pending Services",
              value: formatCount(pendingServices),
              sub: "Needs assignment",
              icon: Clock,
              iconClass: "text-orange-600",
            },
            {
              label: "Completed Today",
              value: formatCount(completedToday),
              sub: `${completedThisWeek} this week`,
              icon: CheckCircle2,
              iconClass: "text-emerald-600",
            },
            {
              label: "Active Workers",
              value: formatCount(activeWorkers),
              sub: "Currently assigned",
              icon: Users,
              iconClass: "text-purple-600",
            },
            {
              label: "Avg Rating",
              value: avgRating.toFixed(1),
              sub: `From ${data.feedbacks.length} reviews`,
              icon: Star,
              iconClass: "text-amber-500",
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.label} className="rounded-[1.6rem] border border-slate2-200 bg-white p-4 shadow-card">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate2-400">{card.label}</p>
                  <Icon className={`h-5 w-5 ${card.iconClass}`} />
                </div>
                <p className="mt-4 text-2xl font-black text-slate2-900">{card.value}</p>
                <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate2-500">
                  {"mark" in card ? <span className={card.trend}>{card.mark}</span> : null}
                  <span>{card.sub}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    );
  }

  function renderBookings() {
    return (
      <section className="space-y-5">
        <div className="flex flex-wrap gap-3 rounded-[2rem] border border-slate2-200 bg-white p-4 shadow-card">
          <label className="flex min-w-[260px] flex-1 items-center gap-2 rounded-2xl border border-slate2-200 bg-slate2-50 px-4 py-3 text-sm text-slate2-500">
            <Search className="h-4 w-4" />
            <input
              value={bookingSearch}
              onChange={(event) => setBookingSearch(event.target.value)}
              placeholder="Search by customer, service, or booking ID"
              className="w-full bg-transparent outline-none"
            />
          </label>
          <select
            value={bookingSort}
            onChange={(event) => setBookingSort(event.target.value)}
            className="rounded-2xl border border-slate2-200 bg-white px-4 py-3 text-sm font-semibold text-slate2-700"
          >
            <option value="date">Date</option>
            <option value="amount">Amount</option>
            <option value="status">Status</option>
          </select>
          <button
            type="button"
            onClick={exportBookingsCsv}
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 text-sm font-bold text-white"
          >
            <Download className="h-4 w-4" /> Download CSV
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {["all", "pending", "confirmed", "completed", "cancelled"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setBookingFilter(status)}
              className={`rounded-full px-4 py-2 text-xs font-bold ${
                bookingFilter === status ? "bg-brand-600 text-white" : "bg-white text-slate2-600"
              }`}
            >
              {status === "all" ? "All" : formatLabel(status)}
            </button>
          ))}
        </div>

        <div className="hidden overflow-hidden rounded-[2rem] border border-slate2-200 bg-white shadow-card md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate2-50 text-left text-xs font-black uppercase tracking-[0.12em] text-slate2-500">
                <tr>
                  <th className="px-4 py-4">Booking ID</th>
                  <th className="px-4 py-4">Customer Name + Email</th>
                  <th className="px-4 py-4">Service Name</th>
                  <th className="px-4 py-4">Sub-Service</th>
                  <th className="px-4 py-4">Worker Assigned</th>
                  <th className="px-4 py-4">Date & Time</th>
                  <th className="px-4 py-4">Amount</th>
                  <th className="px-4 py-4">Payment Method</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate2-100">
                {paginatedBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-4 py-4 font-mono text-xs font-bold text-slate2-700">{booking.bookingCode}</td>
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate2-900">{booking.customerName}</p>
                      <p className="text-xs text-slate2-500">{booking.customerEmail}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate2-900">{booking.serviceName}</p>
                      <p className="text-xs text-slate2-500">{formatLabel(booking.serviceCategory)}</p>
                    </td>
                    <td className="px-4 py-4 text-slate2-600">{booking.subService}</td>
                    <td className="px-4 py-4 text-slate2-700">{booking.workerName}</td>
                    <td className="px-4 py-4 text-slate2-600">{formatDateTime(booking.bookingDate)}</td>
                    <td className="px-4 py-4 font-bold text-slate2-900">{formatCurrency(booking.amount)}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate2-100 px-3 py-1 text-xs font-bold text-slate2-700">
                        {paymentMethodIcon(booking.paymentMethod)}
                        {PAYMENT_METHOD_LABELS[booking.paymentMethod]}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${BOOKING_STATUS_STYLES[booking.status]}`}>
                        {formatLabel(booking.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <select
                            value={assignSelections[booking.id] ?? ""}
                            onChange={(event) =>
                              setAssignSelections((current) => ({
                                ...current,
                                [booking.id]: event.target.value,
                              }))
                            }
                            className="rounded-xl border border-slate2-200 bg-slate2-50 px-3 py-2 text-xs font-semibold text-slate2-700"
                          >
                            <option value="">Assign Worker</option>
                            {data.workers.map((worker) => (
                              <option key={worker.id} value={worker.id}>
                                {worker.fullName} ({worker.specialization})
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => assignWorker(booking.id)}
                            className="rounded-xl bg-brand-600 px-3 py-2 text-xs font-bold text-white"
                          >
                            Assign
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => runMutation("/api/admin/bookings", { bookingId: booking.id, action: "complete" }, "Booking marked completed")}
                            className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white"
                          >
                            Mark Complete
                          </button>
                          <button
                            type="button"
                            onClick={() => runMutation("/api/admin/bookings", { bookingId: booking.id, action: "cancel" }, "Booking cancelled")}
                            className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3 md:hidden">
          {paginatedBookings.map((booking) => (
            <article key={booking.id} className="rounded-[1.6rem] border border-slate2-200 bg-white p-4 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs font-bold text-slate2-500">{booking.bookingCode}</p>
                  <p className="mt-1 text-lg font-black text-slate2-900">{booking.customerName}</p>
                  <p className="text-xs text-slate2-500">{booking.customerEmail}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${BOOKING_STATUS_STYLES[booking.status]}`}>
                  {formatLabel(booking.status)}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate2-400">Service</p>
                  <p className="font-semibold text-slate2-800">{booking.serviceName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate2-400">Sub-Service</p>
                  <p className="font-semibold text-slate2-800">{booking.subService}</p>
                </div>
                <div>
                  <p className="text-xs text-slate2-400">Worker</p>
                  <p className="font-semibold text-slate2-800">{booking.workerName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate2-400">Amount</p>
                  <p className="font-semibold text-slate2-800">{formatCurrency(booking.amount)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setBookingPage((current) => Math.max(1, current - 1))}
            className="rounded-xl border border-slate2-200 bg-white p-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: totalBookingPages }, (_, index) => index + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setBookingPage(page)}
              className={`rounded-xl px-3 py-2 text-sm font-bold ${
                page === bookingPage ? "bg-brand-600 text-white" : "bg-white text-slate2-600"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setBookingPage((current) => Math.min(totalBookingPages, current + 1))}
            className="rounded-xl border border-slate2-200 bg-white p-2"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    );
  }

  function renderPayments() {
    return (
      <section className="space-y-5">
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <article className="rounded-[1.6rem] border border-slate2-200 bg-white p-4 shadow-card md:col-span-2">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate2-400">Total Revenue This Month</p>
            <p className="mt-3 text-3xl font-black text-slate2-900">{formatCurrency(monthPaymentRevenue)}</p>
          </article>
          {paymentMethodSummary.map((entry) => (
            <article key={entry.method} className="rounded-[1.6rem] border border-slate2-200 bg-white p-4 shadow-card">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate2-400">{PAYMENT_METHOD_LABELS[entry.method]}</p>
              <p className="mt-3 text-xl font-black text-slate2-900">{entry.count}</p>
              <p className="text-sm font-semibold text-slate2-500">{formatCurrency(entry.total)}</p>
            </article>
          ))}
          <article className="rounded-[1.6rem] border border-slate2-200 bg-white p-4 shadow-card">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate2-400">Pending Payments</p>
            <p className="mt-3 text-xl font-black text-slate2-900">{pendingPayments.length}</p>
            <p className="text-sm font-semibold text-slate2-500">
              {formatCurrency(pendingPayments.reduce((sum, payment) => sum + payment.amount, 0))}
            </p>
          </article>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[2rem] border border-slate2-200 bg-white p-5 shadow-card">
            <div className="flex flex-wrap gap-3">
              <label className="flex min-w-[240px] flex-1 items-center gap-2 rounded-2xl border border-slate2-200 bg-slate2-50 px-4 py-3 text-sm text-slate2-500">
                <Search className="h-4 w-4" />
                <input
                  value={paymentSearch}
                  onChange={(event) => setPaymentSearch(event.target.value)}
                  placeholder="Search by transaction or customer"
                  className="w-full bg-transparent outline-none"
                />
              </label>
              <select
                value={paymentMethodFilter}
                onChange={(event) => setPaymentMethodFilter(event.target.value)}
                className="rounded-2xl border border-slate2-200 bg-white px-4 py-3 text-sm font-semibold text-slate2-700"
              >
                <option value="all">All Methods</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="cash">COD</option>
                <option value="netbanking">Net Banking</option>
              </select>
              <select
                value={paymentStatusFilter}
                onChange={(event) => setPaymentStatusFilter(event.target.value)}
                className="rounded-2xl border border-slate2-200 bg-white px-4 py-3 text-sm font-semibold text-slate2-700"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
              <select
                value={paymentRange}
                onChange={(event) => setPaymentRange(event.target.value)}
                className="rounded-2xl border border-slate2-200 bg-white px-4 py-3 text-sm font-semibold text-slate2-700"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate2-50 px-4 py-3">
              <p className="text-sm font-semibold text-slate2-500">Revenue for selected filters</p>
              <p className="text-lg font-black text-slate2-900">{formatCurrency(filteredPaymentRevenue)}</p>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs font-black uppercase tracking-[0.12em] text-slate2-500">
                  <tr>
                    <th className="px-2 py-3">Transaction ID</th>
                    <th className="px-2 py-3">Booking ID</th>
                    <th className="px-2 py-3">Customer Name</th>
                    <th className="px-2 py-3">Service</th>
                    <th className="px-2 py-3">Amount</th>
                    <th className="px-2 py-3">Payment Method</th>
                    <th className="px-2 py-3">Payment Status</th>
                    <th className="px-2 py-3">Date & Time</th>
                    <th className="px-2 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate2-100">
                  {paymentsFiltered.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-2 py-3 font-mono text-xs font-bold text-slate2-700">{payment.transactionId}</td>
                      <td className="px-2 py-3 font-mono text-xs text-slate2-500">{payment.bookingCode}</td>
                      <td className="px-2 py-3 text-slate2-800">{payment.customerName}</td>
                      <td className="px-2 py-3 text-slate2-600">{payment.serviceName}</td>
                      <td className="px-2 py-3 font-bold text-slate2-900">{formatCurrency(payment.amount)}</td>
                      <td className="px-2 py-3">
                        <span className="inline-flex items-center gap-2 rounded-full bg-slate2-100 px-3 py-1 text-xs font-bold text-slate2-700">
                          {paymentMethodIcon(payment.method)}
                          {PAYMENT_METHOD_LABELS[payment.method]}
                        </span>
                      </td>
                      <td className="px-2 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${PAYMENT_STATUS_STYLES[payment.status]}`}>
                          {formatLabel(payment.status)}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-slate2-600">{formatDateTime(payment.dateTime)}</td>
                      <td className="px-2 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => runMutation("/api/admin/payments", { paymentId: payment.id, action: "mark_paid" }, "Payment marked paid")}
                            className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white"
                          >
                            Mark Paid
                          </button>
                          <button
                            type="button"
                            onClick={() => runMutation("/api/admin/payments", { paymentId: payment.id, action: "refund" }, "Refund issued")}
                            className="rounded-xl bg-slate2-800 px-3 py-2 text-xs font-bold text-white"
                          >
                            Issue Refund
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate2-200 bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Revenue Chart</p>
                <h2 className="mt-2 text-2xl font-black text-slate2-900">Last 7 Days</h2>
              </div>
              <TrendingUp className="h-5 w-5 text-brand-600" />
            </div>
            <div className="mt-6 flex h-72 items-end justify-between gap-3 rounded-[1.6rem] bg-slate2-50 p-4">
              {revenueBars.map((entry, index) => (
                <div key={`${entry.label}-${index}`} className="group flex h-full flex-1 flex-col items-center justify-end gap-3">
                  <div className="text-[11px] font-semibold text-slate2-400 opacity-0 transition group-hover:opacity-100">
                    {formatCurrency(entry.amount)}
                  </div>
                  <div className="flex h-full w-full items-end">
                    <div
                      title={formatCurrency(entry.amount)}
                      className={`w-full rounded-t-2xl bg-brand-600 ${index < 5 ? "opacity-60" : "opacity-100"}`}
                      style={{ height: `${Math.max(12, (entry.amount / maxRevenueBar) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate2-500">{entry.label}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    );
  }

  function renderFeedback() {
    return (
      <section className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            ["Average Service Rating", average(data.feedbacks.map((feedback) => feedback.serviceStars)).toFixed(1), `${data.feedbacks.length} ratings`],
            ["Average Worker Rating", average(data.feedbacks.map((feedback) => feedback.workerStars)).toFixed(1), `${data.feedbacks.length} ratings`],
            ["Total Reviews", String(data.feedbacks.length), "Across all services"],
            ["5-Star Reviews", String(data.feedbacks.filter((feedback) => Math.min(feedback.serviceStars, feedback.workerStars) === 5).length), "Top customer experiences"],
            ["Reviews This Week", String(data.feedbacks.filter((feedback) => isWithinRange(feedback.createdAt, weekStart, endOfDay(now))).length), "Fresh incoming feedback"],
          ].map(([label, value, sub]) => (
            <article key={label} className="rounded-[1.6rem] border border-slate2-200 bg-white p-4 shadow-card">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate2-400">{label}</p>
              <p className="mt-3 text-2xl font-black text-slate2-900">{value}</p>
              <p className="mt-1 text-sm text-slate2-500">{sub}</p>
            </article>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 rounded-[2rem] border border-slate2-200 bg-white p-4 shadow-card">
          <label className="flex min-w-[260px] flex-1 items-center gap-2 rounded-2xl border border-slate2-200 bg-slate2-50 px-4 py-3 text-sm text-slate2-500">
            <Search className="h-4 w-4" />
            <input
              value={feedbackSearch}
              onChange={(event) => setFeedbackSearch(event.target.value)}
              placeholder="Search by customer or service"
              className="w-full bg-transparent outline-none"
            />
          </label>
          <select
            value={feedbackFilter}
            onChange={(event) => setFeedbackFilter(event.target.value)}
            className="rounded-2xl border border-slate2-200 bg-white px-4 py-3 text-sm font-semibold text-slate2-700"
          >
            <option value="all">All</option>
            <option value="5-star">5-star</option>
            <option value="4-star">4-star</option>
            <option value="3-star">3-star</option>
            <option value="low">Low Rated</option>
          </select>
          <select
            value={feedbackSort}
            onChange={(event) => setFeedbackSort(event.target.value)}
            className="rounded-2xl border border-slate2-200 bg-white px-4 py-3 text-sm font-semibold text-slate2-700"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>

        <div className="space-y-4">
          {feedbackFiltered.map((feedback) => {
            const lowRated = Math.min(feedback.serviceStars, feedback.workerStars) <= 2;
            const expanded = expandedFeedback[feedback.id];
            const showFull = expanded || feedback.comment.length <= 140;
            return (
              <article
                key={feedback.id}
                className={`rounded-[2rem] border p-5 shadow-card ${
                  lowRated ? "border-rose-200 bg-rose-50/70" : "border-slate2-200 bg-white"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-sm font-black text-brand-700">
                      {feedback.customerName
                        .split(" ")
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="font-black text-slate2-900">{feedback.customerName}</p>
                      <p className="text-xs text-slate2-500">
                        {feedback.serviceName} - {feedback.subService}
                      </p>
                      <p className="text-xs text-slate2-400">Worker: {feedback.workerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {lowRated ? (
                      <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-700">
                        Needs Attention
                      </span>
                    ) : null}
                    <span className="text-xs font-semibold text-slate2-400">{formatDateTime(feedback.createdAt)}</span>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate2-400">Service Stars</p>
                    <div className="mt-2">{renderStars(feedback.serviceStars, `service-${feedback.id}`)}</div>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate2-400">Worker Stars</p>
                    <div className="mt-2">{renderStars(feedback.workerStars, `worker-${feedback.id}`)}</div>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate2-700">
                  {showFull ? feedback.comment : `${feedback.comment.slice(0, 140)}...`}
                </p>
                {feedback.comment.length > 140 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedFeedback((current) => ({
                        ...current,
                        [feedback.id]: !current[feedback.id],
                      }))
                    }
                    className="mt-2 text-xs font-bold text-brand-600"
                  >
                    {expanded ? "Show Less" : "Read More"}
                  </button>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  {feedback.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate2-100 px-3 py-1 text-xs font-bold text-slate2-600">
                      {tag}
                    </span>
                  ))}
                </div>

                {feedback.adminReply ? (
                  <div className="mt-4 rounded-2xl bg-brand-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">Admin Reply</p>
                    <p className="mt-2 text-sm text-brand-900">{feedback.adminReply}</p>
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setReplyingTo((current) => (current === feedback.id ? null : feedback.id))}
                    className="rounded-2xl border border-slate2-200 px-4 py-2 text-sm font-bold text-slate2-700"
                  >
                    Reply
                  </button>
                  <button
                    type="button"
                    onClick={() => runMutation("/api/admin/feedback", { feedbackId: feedback.id, action: "flag" }, "Review flagged")}
                    className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-bold text-white"
                  >
                    Flag
                  </button>
                </div>

                {replyingTo === feedback.id ? (
                  <div className="mt-4 rounded-2xl border border-slate2-200 bg-white p-4">
                    <textarea
                      value={replyDrafts[feedback.id] ?? ""}
                      onChange={(event) =>
                        setReplyDrafts((current) => ({
                          ...current,
                          [feedback.id]: event.target.value,
                        }))
                      }
                      rows={3}
                      placeholder="Add an admin response"
                      className="w-full resize-none rounded-2xl border border-slate2-200 bg-slate2-50 px-4 py-3 text-sm outline-none focus:border-brand-400"
                    />
                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setReplyingTo(null)}
                        className="rounded-2xl border border-slate2-200 px-4 py-2 text-sm font-semibold text-slate2-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          runMutation(
                            "/api/admin/feedback",
                            { feedbackId: feedback.id, action: "reply", reply: replyDrafts[feedback.id] ?? "" },
                            "Reply added",
                          )
                        }
                        className="rounded-2xl bg-brand-600 px-4 py-2 text-sm font-bold text-white"
                      >
                        Save Reply
                      </button>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
    );
  }

  function renderSales() {
    return (
      <section className="space-y-5">
        <div className="flex flex-wrap gap-2 rounded-[2rem] border border-slate2-200 bg-white p-4 shadow-card">
          {[
            ["today", "Today"],
            ["week", "This Week"],
            ["month", "This Month"],
            ["quarter", "Last 3 Months"],
            ["custom", "Custom Range"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setSalesRange(value)}
              className={`rounded-full px-4 py-2 text-xs font-bold ${
                salesRange === value ? "bg-brand-600 text-white" : "bg-slate2-100 text-slate2-600"
              }`}
            >
              {label}
            </button>
          ))}
          {salesRange === "custom" ? (
            <div className="flex flex-wrap gap-2">
              <input type="date" value={salesFrom} onChange={(event) => setSalesFrom(event.target.value)} className="rounded-2xl border border-slate2-200 px-4 py-2 text-sm" />
              <input type="date" value={salesTo} onChange={(event) => setSalesTo(event.target.value)} className="rounded-2xl border border-slate2-200 px-4 py-2 text-sm" />
            </div>
          ) : null}
          <button
            type="button"
            onClick={exportSalesReport}
            className="ml-auto inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white"
          >
            <Download className="h-4 w-4" /> Download Report
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Total Sales Count", String(salesValid.length)],
            ["Total Revenue", formatCurrency(salesRevenue)],
            ["Average Order Value", formatCurrency(averageOrderValue)],
            ["Most Popular Service", popularService ? `${popularService[0]} (${popularService[1]})` : "N/A"],
            ["Most Active Worker", activeWorker ? `${activeWorker[0]} (${activeWorker[1]})` : "N/A"],
            ["Peak Booking Hour", peakHour?.[0] ?? "N/A"],
            ["Cancellation Rate", `${cancellationRate.toFixed(1)}%`],
          ].map(([label, value]) => (
            <article key={label} className="rounded-[1.6rem] border border-slate2-200 bg-white p-4 shadow-card">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate2-400">{label}</p>
              <p className="mt-3 text-xl font-black text-slate2-900">{value}</p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  function renderWorkers() {
    return (
      <section className="space-y-5">
        <div className="flex items-center justify-between rounded-[2rem] border border-slate2-200 bg-white p-4 shadow-card">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Worker Management</p>
            <h2 className="mt-2 text-2xl font-black text-slate2-900">Team performance</h2>
          </div>
          <button
            type="button"
            onClick={() => setWorkerModalOpen(true)}
            className="rounded-2xl bg-brand-600 px-4 py-3 text-sm font-bold text-white"
          >
            Add Worker
          </button>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          {workersView.map((worker) => (
            <article key={worker.id} className="rounded-[2rem] border border-slate2-200 bg-white p-5 shadow-card">
              <div className="flex flex-wrap items-start gap-4">
                <img src={worker.photoUrl} alt={worker.fullName} className="h-20 w-20 rounded-[1.4rem] object-cover" />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-black text-slate2-900">{worker.fullName}</h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${DUTY_STATUS_STYLES[worker.dutyStatus]}`}>
                      {formatLabel(worker.dutyStatus)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate2-500">
                    {worker.specialization} - {worker.city}
                  </p>
                  <div className="mt-2">{renderStars(Math.round(worker.rating), `worker-score-${worker.id}`)}</div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-2xl bg-slate2-50 p-3">
                  <p className="text-xs text-slate2-400">Total Jobs</p>
                  <p className="mt-1 text-lg font-black text-slate2-900">{worker.totalJobs}</p>
                </div>
                <div className="rounded-2xl bg-slate2-50 p-3">
                  <p className="text-xs text-slate2-400">Jobs Today</p>
                  <p className="mt-1 text-lg font-black text-slate2-900">{worker.jobsToday}</p>
                </div>
                <div className="rounded-2xl bg-slate2-50 p-3">
                  <p className="text-xs text-slate2-400">This Month</p>
                  <p className="mt-1 text-lg font-black text-slate2-900">{formatCurrency(worker.earningsThisMonth)}</p>
                </div>
                <div className="rounded-2xl bg-slate2-50 p-3">
                  <p className="text-xs text-slate2-400">Status</p>
                  <button
                    type="button"
                    onClick={() =>
                      runMutation(
                        "/api/admin/workers",
                        {
                          workerId: worker.id,
                          dutyStatus:
                            worker.dutyStatus === "available"
                              ? "busy"
                              : worker.dutyStatus === "busy"
                                ? "off_duty"
                                : "available",
                        },
                        "Worker status updated",
                      )
                    }
                    className={`mt-1 rounded-full px-3 py-1 text-xs font-bold ${DUTY_STATUS_STYLES[worker.dutyStatus]}`}
                  >
                    {formatLabel(worker.dutyStatus)}
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate2-500">
                  <span>Jobs completed vs target</span>
                  <span>{worker.jobsThisMonth}/20</span>
                </div>
                <div className="mt-2 h-3 rounded-full bg-slate2-100">
                  <div className={`h-3 rounded-full ${performanceBarClass(worker.performance)}`} style={{ width: `${Math.max(6, worker.performance)}%` }} />
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-slate2-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black text-slate2-900">Assigned bookings</p>
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedWorkers((current) => ({
                        ...current,
                        [worker.id]: !current[worker.id],
                      }))
                    }
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-600"
                  >
                    View Full Profile
                    <ChevronDown className={`h-4 w-4 transition ${expandedWorkers[worker.id] ? "rotate-180" : ""}`} />
                  </button>
                </div>
                <div className="mt-3 space-y-2">
                  {(expandedWorkers[worker.id] ? worker.assignedBookings : worker.assignedBookings.slice(0, 5)).map((booking) => (
                    <div key={`${worker.id}-${booking.bookingCode}`} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm">
                      <div>
                        <p className="font-bold text-slate2-800">{booking.bookingCode}</p>
                        <p className="text-xs text-slate2-500">{booking.serviceName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate2-900">{formatCurrency(booking.amount)}</p>
                        <p className="text-xs text-slate2-400">{formatDate(booking.bookingDate)}</p>
                      </div>
                    </div>
                  ))}
                  {worker.assignedBookings.length === 0 ? <p className="text-sm text-slate2-500">No active assignments.</p> : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-slate2-100 text-slate2-900">
      {toast ? (
        <div className={`fixed bottom-24 left-1/2 z-[70] -translate-x-1/2 rounded-2xl px-4 py-3 text-sm font-bold text-white ${toast.ok ? "bg-slate2-900" : "bg-rose-600"}`}>
          {toast.message}
        </div>
      ) : null}

      {workerModalOpen ? (
        <div className="modal-wrap open z-[60]">
          <div className="modal-box w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">New Worker</p>
                <h3 className="mt-2 text-2xl font-black text-slate2-900">Add Worker</h3>
              </div>
              <button type="button" onClick={() => setWorkerModalOpen(false)} className="rounded-full bg-slate2-100 p-2 text-slate2-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["name", "Name"],
                ["phone", "Phone"],
                ["specialization", "Specialization"],
                ["city", "City"],
              ].map(([key, label]) => (
                <label key={key} className="space-y-2 text-sm font-semibold text-slate2-600">
                  <span>{label}</span>
                  <input
                    value={newWorker[key as keyof typeof newWorker]}
                    onChange={(event) => setNewWorker((current) => ({ ...current, [key]: event.target.value }))}
                    className="w-full rounded-2xl border border-slate2-200 bg-slate2-50 px-4 py-3 outline-none focus:border-brand-400 focus:bg-white"
                  />
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setWorkerModalOpen(false)} className="rounded-2xl border border-slate2-200 px-4 py-2.5 text-sm font-semibold text-slate2-600">
                Cancel
              </button>
              <button type="button" onClick={addWorker} className="rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white">
                Add Worker
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto flex min-h-screen max-w-[1800px]">
        <aside className="hidden w-80 flex-col border-r border-slate2-200 bg-slate2-900 px-5 py-6 text-white lg:flex">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-brand-600 p-3">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-black">ServiceHub</p>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand-300">Admin Panel</p>
              </div>
            </div>
            <p className="mt-4 text-xs font-mono text-slate2-400">{formatClock(now)}</p>
          </div>

          <nav className="mt-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl border-l-4 px-4 py-3 text-left text-sm font-semibold ${
                    active ? "border-brand-400 bg-brand-600 text-white" : "border-transparent text-slate2-400 hover:bg-slate2-800 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? <span className={`rounded-full px-2 py-0.5 text-xs font-black ${active ? "bg-white/20" : "bg-slate2-700"}`}>{item.badge}</span> : null}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-[2rem] border border-rose-500/20 bg-slate2-950 p-5">
            <div className="mb-4 flex items-center gap-3 text-rose-300">
              <LogOut className="h-5 w-5" />
              <p className="text-sm font-bold">Secure Admin Session</p>
            </div>
            <AdminLogoutButton />
          </div>
        </aside>
      </div>
    </div>
    );
  }
