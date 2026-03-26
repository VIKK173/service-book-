import { PROS } from "@/lib/data";
import { BookingModel } from "@/lib/models/Booking";
import { FeedbackModel } from "@/lib/models/Feedback";
import { PaymentModel } from "@/lib/models/Payment";
import { WorkerModel } from "@/lib/models/Worker";

const PHOTO_FALLBACKS = PROS.map((pro) => pro.img);

export const SALES_CATEGORIES = [
  "cleaning",
  "ac",
  "furniture",
  "painting",
  "salon",
  "plumbing",
] as const;

export type DashboardBookingStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "accepted"
  | "on_the_way";

export type DashboardPaymentMethod = "upi" | "card" | "cash" | "netbanking";
export type DashboardPaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type WorkerDutyStatus = "available" | "busy" | "off_duty";

export type AdminDashboardBooking = {
  id: string;
  bookingCode: string;
  customerName: string;
  customerEmail: string;
  serviceName: string;
  serviceCategory: string;
  subService: string;
  workerId: string | null;
  workerName: string;
  bookingDate: string;
  createdAt: string;
  completedAt: string | null;
  amount: number;
  paymentMethod: DashboardPaymentMethod;
  paymentStatus: DashboardPaymentStatus;
  status: DashboardBookingStatus;
};

export type AdminDashboardPayment = {
  id: string;
  bookingId: string;
  bookingCode: string;
  transactionId: string;
  customerName: string;
  serviceName: string;
  amount: number;
  method: DashboardPaymentMethod;
  status: DashboardPaymentStatus;
  dateTime: string;
};

export type AdminDashboardFeedback = {
  id: string;
  bookingId: string;
  bookingCode: string;
  customerName: string;
  customerEmail: string;
  serviceName: string;
  subService: string;
  workerName: string;
  serviceStars: number;
  workerStars: number;
  comment: string;
  tags: string[];
  adminReply: string;
  isFlagged: boolean;
  createdAt: string;
};

export type AdminDashboardWorker = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  city: string;
  rating: number;
  totalJobs: number;
  isAvailable: boolean;
  dutyStatus: WorkerDutyStatus;
  photoUrl: string;
  assignedBookings: Array<{
    bookingCode: string;
    serviceName: string;
    status: string;
    bookingDate: string;
    amount: number;
  }>;
};

export type AdminDashboardData = {
  generatedAt: string;
  bookings: AdminDashboardBooking[];
  payments: AdminDashboardPayment[];
  feedbacks: AdminDashboardFeedback[];
  workers: AdminDashboardWorker[];
};

function toBookingCode(rawCode: unknown, index: number) {
  if (typeof rawCode === "string" && rawCode.trim()) {
    return rawCode.startsWith("#") ? rawCode : `#${rawCode}`;
  }

  return `#SH${1001 + index}`;
}

function toTransactionId(rawId: unknown, dateTime: Date, index: number) {
  if (typeof rawId === "string" && rawId.trim()) {
    return rawId;
  }

  return `TXN${dateTime.getTime()}${String(index).padStart(2, "0")}`;
}

function titleCase(value: string) {
  return value
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function withFallbackPhoto(photoUrl: unknown, index: number) {
  if (typeof photoUrl === "string" && photoUrl.trim()) {
    return photoUrl;
  }

  return PHOTO_FALLBACKS[index % PHOTO_FALLBACKS.length] ?? PHOTO_FALLBACKS[0] ?? "";
}

function withFallbackDutyStatus(status: unknown, isAvailable: boolean): WorkerDutyStatus {
  if (status === "available" || status === "busy" || status === "off_duty") {
    return status;
  }

  return isAvailable ? "available" : "busy";
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [bookingsRaw, paymentsRaw, feedbacksRaw, workersRaw] = await Promise.all([
    BookingModel.find({})
      .populate("userId", "fullName email")
      .populate("serviceId", "name category")
      .populate("workerId", "fullName")
      .sort({ bookingDate: -1, createdAt: -1 })
      .lean(),
    PaymentModel.find({})
      .populate("bookingId", "bookingCode")
      .sort({ createdAt: -1 })
      .lean(),
    FeedbackModel.find({})
      .populate("bookingId", "bookingCode subService")
      .populate("userId", "fullName email")
      .populate("serviceId", "name")
      .populate("workerId", "fullName")
      .sort({ createdAt: -1 })
      .lean(),
    WorkerModel.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const paymentByBookingId = new Map<string, any>();
  paymentsRaw.forEach((payment, index) => {
    const bookingId =
      typeof payment.bookingId === "object" && payment.bookingId && "_id" in payment.bookingId
        ? String((payment.bookingId as { _id: unknown })._id)
        : String(payment.bookingId);

    paymentByBookingId.set(bookingId, {
      ...payment,
      bookingCode: toBookingCode(
        typeof payment.bookingId === "object" && payment.bookingId && "bookingCode" in payment.bookingId
          ? (payment.bookingId as { bookingCode?: unknown }).bookingCode
          : "",
        index,
      ),
    });
  });

  const bookings: AdminDashboardBooking[] = bookingsRaw.map((booking: any, index) => {
    const payment = paymentByBookingId.get(String(booking._id));
    const serviceName = booking.serviceId?.name ?? "Service";
    const subService =
      typeof booking.subService === "string" && booking.subService.trim()
        ? booking.subService
        : `${serviceName} Standard`;
    const bookingDate = new Date(booking.bookingDate ?? booking.createdAt ?? Date.now());

    return {
      id: String(booking._id),
      bookingCode: toBookingCode(booking.bookingCode, index),
      customerName: booking.userId?.fullName ?? "Guest Customer",
      customerEmail: booking.userId?.email ?? "customer@servicehub.local",
      serviceName,
      serviceCategory: booking.serviceId?.category ?? "general",
      subService,
      workerId: booking.workerId?._id ? String(booking.workerId._id) : null,
      workerName: booking.workerId?.fullName ?? "Unassigned",
      bookingDate: bookingDate.toISOString(),
      createdAt: new Date(booking.createdAt ?? bookingDate).toISOString(),
      completedAt: booking.completedAt ? new Date(booking.completedAt).toISOString() : null,
      amount: Number(booking.amount ?? 0),
      paymentMethod: (payment?.method ?? "upi") as DashboardPaymentMethod,
      paymentStatus: (payment?.status ?? booking.paymentStatus ?? "pending") as DashboardPaymentStatus,
      status: booking.status as DashboardBookingStatus,
    };
  });

  const bookingsById = new Map(bookings.map((booking) => [booking.id, booking]));

  const payments: AdminDashboardPayment[] = paymentsRaw.map((payment: any, index) => {
    const bookingId =
      typeof payment.bookingId === "object" && payment.bookingId && "_id" in payment.bookingId
        ? String(payment.bookingId._id)
        : String(payment.bookingId);
    const booking = bookingsById.get(bookingId);
    const dateTime = new Date(payment.paidAt ?? payment.createdAt ?? Date.now());

    return {
      id: String(payment._id),
      bookingId,
      bookingCode: booking?.bookingCode ?? toBookingCode(payment.bookingId?.bookingCode, index),
      transactionId: toTransactionId(payment.transactionId, dateTime, index),
      customerName: booking?.customerName ?? "Guest Customer",
      serviceName: booking?.serviceName ?? "Service",
      amount: Number(payment.amount ?? booking?.amount ?? 0),
      method: (payment.method ?? booking?.paymentMethod ?? "upi") as DashboardPaymentMethod,
      status: (payment.status ?? booking?.paymentStatus ?? "pending") as DashboardPaymentStatus,
      dateTime: dateTime.toISOString(),
    };
  });

  const bookingsByWorkerId = new Map<string, AdminDashboardBooking[]>();
  bookings.forEach((booking) => {
    if (!booking.workerId) {
      return;
    }

    const existing = bookingsByWorkerId.get(booking.workerId) ?? [];
    existing.push(booking);
    bookingsByWorkerId.set(booking.workerId, existing);
  });

  const workers: AdminDashboardWorker[] = workersRaw.map((worker: any, index) => {
    const assignedBookings = (bookingsByWorkerId.get(String(worker._id)) ?? [])
      .filter((booking) => !["completed", "cancelled"].includes(booking.status))
      .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
      .slice(0, 5)
      .map((booking) => ({
        bookingCode: booking.bookingCode,
        serviceName: booking.serviceName,
        status: titleCase(booking.status),
        bookingDate: booking.bookingDate,
        amount: booking.amount,
      }));

    return {
      id: String(worker._id),
      fullName: worker.fullName,
      email: worker.email,
      phone: worker.phone,
      specialization: worker.category,
      city: worker.city ?? "Ranchi",
      rating: Number(worker.rating ?? 4.5),
      totalJobs: Number(worker.totalJobs ?? 0),
      isAvailable: Boolean(worker.isAvailable),
      dutyStatus: withFallbackDutyStatus(worker.dutyStatus, Boolean(worker.isAvailable)),
      photoUrl: withFallbackPhoto(worker.photoUrl, index),
      assignedBookings,
    };
  });

  const feedbacks: AdminDashboardFeedback[] = feedbacksRaw.map((feedback: any, index) => {
    const bookingId =
      typeof feedback.bookingId === "object" && feedback.bookingId && "_id" in feedback.bookingId
        ? String(feedback.bookingId._id)
        : String(feedback.bookingId);
    const booking = bookingsById.get(bookingId);

    return {
      id: String(feedback._id),
      bookingId,
      bookingCode: booking?.bookingCode ?? toBookingCode(feedback.bookingId?.bookingCode, index),
      customerName: feedback.userId?.fullName ?? booking?.customerName ?? "Customer",
      customerEmail: feedback.userId?.email ?? booking?.customerEmail ?? "customer@servicehub.local",
      serviceName: feedback.serviceId?.name ?? booking?.serviceName ?? "Service",
      subService:
        feedback.bookingId?.subService ??
        booking?.subService ??
        `${feedback.serviceId?.name ?? booking?.serviceName ?? "Service"} Standard`,
      workerName: feedback.workerId?.fullName ?? booking?.workerName ?? "Assigned Worker",
      serviceStars: Number(feedback.serviceStars ?? 0),
      workerStars: Number(feedback.workerStars ?? 0),
      comment: feedback.comment ?? "",
      tags: Array.isArray(feedback.tags) ? feedback.tags : [],
      adminReply: feedback.adminReply ?? "",
      isFlagged: Boolean(feedback.isFlagged),
      createdAt: new Date(feedback.createdAt ?? Date.now()).toISOString(),
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    bookings,
    payments,
    feedbacks,
    workers,
  };
}
