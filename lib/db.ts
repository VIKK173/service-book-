import mongoose from "mongoose";
import dns from "node:dns";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalWithMongoose = global as typeof globalThis & {
  mongoose?: MongooseCache;
};

const cached: MongooseCache = globalWithMongoose.mongoose ?? {
  conn: null,
  promise: null,
};

globalWithMongoose.mongoose = cached;

let dnsServersConfigured = false;

function configureMongoDnsServers() {
  if (dnsServersConfigured) {
    return;
  }

  const rawServers = process.env.MONGODB_DNS_SERVERS;
  if (!rawServers) {
    dnsServersConfigured = true;
    return;
  }

  const servers = rawServers
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean);

  if (servers.length === 0) {
    dnsServersConfigured = true;
    return;
  }

  dns.setServers(servers);
  dnsServersConfigured = true;
}

export async function connectToDatabase() {
  configureMongoDnsServers();

  const MONGODB_URI = process.env.MONGODB_URI ?? "";
  if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI in .env.local");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      dbName: "servicehub",
      family: 4,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;

    const message = error instanceof Error ? error.message : "Unknown MongoDB connection error";
    if (message.includes("querySrv") || message.includes("ENOTFOUND") || message.includes("ECONNREFUSED")) {
      throw new Error(
        "MongoDB DNS lookup failed. Set MONGODB_DNS_SERVERS=8.8.8.8,1.1.1.1 in .env.local or use Atlas standard (non-SRV) connection string.",
      );
    }

    throw error;
  }

  return cached.conn;
}

