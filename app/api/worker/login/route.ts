import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { WorkerModel } from "@/lib/models/Worker";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find worker by email
    const worker = await WorkerModel.findOne({ email }).lean();
    
    if (!worker) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, (worker as any).password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: (worker as any)._id.toString(),
        email: (worker as any).email,
        fullName: (worker as any).fullName,
        role: "worker"
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      worker: {
        id: (worker as any)._id.toString(),
        fullName: (worker as any).fullName,
        email: (worker as any).email,
        category: (worker as any).category,
        phone: (worker as any).phone,
        city: (worker as any).city,
        dutyStatus: (worker as any).dutyStatus,
        isAvailable: (worker as any).isAvailable
      }
    });

    response.cookies.set({
      name: "worker-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;

  } catch (error) {
    console.error("Worker login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
