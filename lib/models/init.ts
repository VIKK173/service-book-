import { connectToDatabase } from "@/lib/db";

import { AdminModel } from "@/lib/models/Admin";
import { UserModel } from "@/lib/models/User";
import { WorkerModel } from "@/lib/models/Worker";
import { ServiceModel } from "@/lib/models/Service";
import { BookingModel } from "@/lib/models/Booking";
import { PaymentModel } from "@/lib/models/Payment";
import { FeedbackModel } from "@/lib/models/Feedback";

let initialized = false;

export async function ensureDatabaseCollections() {
  if (initialized) {
    return;
  }

  const conn = await connectToDatabase();
  const db = conn.connection.db;

  if (!db) {
    throw new Error("Failed to access MongoDB database instance");
  }

  const collections = [
    AdminModel.collection.name,
    UserModel.collection.name,
    WorkerModel.collection.name,
    ServiceModel.collection.name,
    BookingModel.collection.name,
    PaymentModel.collection.name,
    FeedbackModel.collection.name,
  ];

  const existingCollections = await db.listCollections({}, { nameOnly: true }).toArray();
  const existingNames = new Set(existingCollections.map((item) => item.name));

  for (const collection of collections) {
    if (!existingNames.has(collection)) {
      await db.createCollection(collection);
    }
  }

  await Promise.all([
    AdminModel.syncIndexes(),
    UserModel.syncIndexes(),
    WorkerModel.syncIndexes(),
    ServiceModel.syncIndexes(),
    BookingModel.syncIndexes(),
    PaymentModel.syncIndexes(),
    FeedbackModel.syncIndexes(),
  ]);

  initialized = true;
}
