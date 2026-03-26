import { SERVICES, PROS } from "@/lib/data";
import { UserModel } from "@/lib/models/User";
import { WorkerModel } from "@/lib/models/Worker";
import { ServiceModel } from "@/lib/models/Service";
import { BookingModel } from "@/lib/models/Booking";
import { PaymentModel } from "@/lib/models/Payment";
import { FeedbackModel } from "@/lib/models/Feedback";

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export async function seedInitialDataIfEmpty() {
  const [serviceCount, workerCount, userCount, bookingCount, paymentCount, feedbackCount] = await Promise.all([
    ServiceModel.countDocuments(),
    WorkerModel.countDocuments(),
    UserModel.countDocuments(),
    BookingModel.countDocuments(),
    PaymentModel.countDocuments(),
    FeedbackModel.countDocuments(),
  ]);

  if (serviceCount === 0) {
    await ServiceModel.insertMany(
      SERVICES.map((service) => ({
        name: service.name,
        slug: toSlug(service.name),
        category: service.cat,
        description: service.desc,
        basePrice: service.subs[0]?.p ?? 299,
        estimatedDurationMinutes: 60,
        isActive: true,
      })),
      { ordered: false },
    );
  }

  if (workerCount === 0) {
    await WorkerModel.insertMany(
      PROS.map((worker) => ({
        fullName: worker.name,
        email: `${toSlug(worker.name)}@servicehub.local`,
        password: "worker123",
        phone: `9${Math.floor(Math.random() * 1000000000).toString().padStart(9, "0")}`,
        category: worker.spec,
        photoUrl: worker.img,
        experienceYears: 3,
        rating: Number(worker.rating),
        totalJobs: Number(String(worker.jobs).replace(/,/g, "")) || 0,
        isAvailable: true,
        dutyStatus: "available",
        city: "Ranchi",
      })),
      { ordered: false },
    );
  }

  if (userCount === 0) {
    const users = await UserModel.insertMany([
      {
        fullName: "Anjali Gupta",
        email: "anjali@example.com",
        phone: "9876543210",
        isVerified: true,
        address: { city: "Ranchi", state: "Jharkhand", pincode: "834001" },
      },
      {
        fullName: "Vikram Singh",
        email: "vikram@example.com",
        phone: "9876543211",
        isVerified: true,
        address: { city: "Patna", state: "Bihar", pincode: "800001" },
      },
      {
        fullName: "Meera Nair",
        email: "meera@example.com",
        phone: "9876543212",
        isVerified: true,
        address: { city: "Jamshedpur", state: "Jharkhand", pincode: "831001" },
      },
    ]);

    if (bookingCount === 0) {
      const services = await ServiceModel.find({}, { _id: 1, basePrice: 1 }).limit(4).lean();
      const workers = await WorkerModel.find({}, { _id: 1 }).limit(4).lean();

      if (services.length > 0 && workers.length > 0) {
        const today = new Date();

        await BookingModel.insertMany(
          Array.from({ length: 20 }).map((_, index) => {
            const user = users[index % users.length];
            const service = services[index % services.length];
            const worker = workers[index % workers.length];
            const bookingDate = new Date(today);
            bookingDate.setDate(today.getDate() - (index % 12));
            bookingDate.setHours(10 + (index % 8), 0, 0, 0);

            const isCompleted = index % 4 !== 0;

            return {
              userId: user._id,
              serviceId: service._id,
              workerId: worker._id,
              bookingCode: `#SH${1001 + index}`,
              subService: SERVICES[index % SERVICES.length]?.subs[0]?.n ?? "General Service",
              bookingDate,
              completedAt: isCompleted ? new Date(bookingDate.getTime() + 2 * 60 * 60 * 1000) : null,
              amount: service.basePrice + (index % 5) * 120,
              status: isCompleted ? "completed" : index % 2 === 0 ? "confirmed" : "pending",
              paymentStatus: isCompleted ? "paid" : index % 3 === 0 ? "failed" : "pending",
              address: {
                city: "Ranchi",
                state: "Jharkhand",
                pincode: "834001",
              },
              notes: "Auto seeded booking",
            };
          }),
        );
      }
    }
  }

  if (paymentCount === 0) {
    const bookings = await BookingModel.find({}, { _id: 1, userId: 1, amount: 1, paymentStatus: 1, bookingDate: 1 })
      .sort({ createdAt: 1 })
      .lean();

    if (bookings.length > 0) {
      const methods = ["upi", "card", "cash", "netbanking"] as const;

      await PaymentModel.insertMany(
        bookings.map((booking, index) => {
          const status = booking.paymentStatus === "failed" ? "failed" : booking.paymentStatus;
          const method = methods[index % methods.length];

          return {
            bookingId: booking._id,
            userId: booking.userId,
            amount: booking.amount,
            method,
            transactionId:
              status === "pending"
                ? ""
                : `TXN${new Date(booking.bookingDate).getTime()}${String(index).padStart(2, "0")}`,
            status,
            paidAt: status === "paid" ? booking.bookingDate : null,
          };
        }),
      );
    }
  }

  if (feedbackCount === 0) {
    const completedBookings = await BookingModel.find({ status: "completed" })
      .populate("serviceId", "name category")
      .populate("workerId", "fullName")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    if (completedBookings.length > 0) {
      const comments = [
        "Quick, polite, and very professional from start to finish.",
        "The service quality was excellent and everything was left spotless.",
        "Solid experience overall. The work was done on time and neatly.",
        "Average service. It got the job done but communication could be better.",
        "The worker arrived late and we had to follow up twice.",
      ];
      const tags = [
        ["On Time", "Clean Work"],
        ["Polite Staff", "Worth the Price"],
        ["Fast Service", "Professional"],
        ["Needs Follow-up"],
        ["Late Arrival"],
      ];

      await FeedbackModel.insertMany(
        completedBookings.map((booking: any, index) => {
          const serviceStars = [5, 5, 4, 3, 2][index % 5];
          const workerStars = [5, 4, 5, 3, 2][index % 5];

          return {
            bookingId: booking._id,
            userId: booking.userId,
            workerId: booking.workerId?._id ?? booking.workerId,
            serviceId: booking.serviceId?._id ?? booking.serviceId,
            serviceStars,
            workerStars,
            comment: comments[index % comments.length],
            tags: tags[index % tags.length],
            adminReply: "",
            isFlagged: serviceStars < 3 || workerStars < 3,
            createdAt: booking.completedAt ?? booking.bookingDate,
            updatedAt: booking.completedAt ?? booking.bookingDate,
          };
        }),
      );
    }
  }
}
