"use client";

import { useState, useEffect } from "react";
import React from "react";
import {
  Package,
  MapPin,
  Clock,
  User,
  Phone,
  Calendar,
  CheckCircle2,
  Truck,
  AlertCircle,
  Home,
} from "lucide-react";

interface Order {
  id: string;
  serviceName: string;
  subService: string;
  status: string;
  bookingDate: string;
  timeSlot: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  workerName?: string;
  workerPhone?: string;
  createdAt?: string;
  tracking: {
    status: "booked" | "confirmed" | "worker_assigned" | "on_the_way" | "in_progress" | "completed" | "cancelled";
    timestamp: string;
    location?: string;
    estimatedArrival?: string;
  };
}

export default function OrderTrackingPage() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchOrder = async () => {
    if (!orderId.trim()) {
      setError("Please enter an order ID");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/track/${orderId.trim()}`);
      const result = await response.json();

      if (result.success) {
        setOrder(result.order);
      } else {
        setError(result.message || "Order not found");
      }
    } catch (err) {
      setError("Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };

  const getTrackingSteps = (status: string) => {
    const steps = [
      { key: "booked", label: "Order Placed", icon: Package, completed: true },
      { key: "confirmed", label: "Order Confirmed", icon: CheckCircle2, completed: false },
      { key: "worker_assigned", label: "Worker Assigned", icon: User, completed: false },
      { key: "on_the_way", label: "On The Way", icon: Truck, completed: false },
      { key: "in_progress", label: "Service In Progress", icon: AlertCircle, completed: false },
      { key: "completed", label: "Service Completed", icon: CheckCircle2, completed: false },
    ];

    const currentIndex = steps.findIndex(step => step.key === status);
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "in_progress":
        return "bg-brand-100 text-brand-700 border-brand-200";
      case "on_the_way":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "worker_assigned":
        return "bg-violet-100 text-violet-700 border-violet-200";
      case "confirmed":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "cancelled":
        return "bg-rose-100 text-rose-700 border-rose-200";
      default:
        return "bg-slate2-100 text-slate2-700 border-slate2-200";
    }
  };

  return (
    <main className="min-h-screen bg-slate2-50 text-slate2-900">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <header className="border-b border-slate2-200 bg-white px-6 py-4">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="flex items-center gap-2 text-sm font-semibold text-slate2-600 hover:text-brand-600"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </a>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 p-2 text-white">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate2-900">Order Tracking</h1>
                <p className="text-xs text-slate2-500">Track your service order in real-time</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Search Section */}
          <div className="mb-8 rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-slate2-900 mb-4">Track Your Order</h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && searchOrder()}
                placeholder="Enter order ID (e.g., #SH1001)"
                className="flex-1 rounded-xl border border-slate2-200 bg-slate2-50 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:bg-white"
              />
              <button
                onClick={searchOrder}
                disabled={loading}
                className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Searching..." : "Track Order"}
              </button>
            </div>
            {error && (
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-rose-50 p-4 text-rose-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}
          </div>

          {/* Order Details */}
          {order && (
            <div className="space-y-6">
              {/* Order Status Card */}
              <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-slate2-900">Order #{order.id.slice(-6)}</h2>
                    <p className="text-sm text-slate2-500">Placed on {new Date(order.createdAt || order.bookingDate).toLocaleDateString("en-IN")}</p>
                  </div>
                  <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${getStatusColor(order.tracking.status)}`}>
                    {getTrackingSteps(order.tracking.status).find(step => step.current)?.icon && 
                      React.createElement(getTrackingSteps(order.tracking.status).find(step => step.current)!.icon, { className: "h-4 w-4" })
                    }
                    {order.tracking.status.replace(/_/g, " ").charAt(0).toUpperCase() + order.tracking.status.replace(/_/g, " ").slice(1)}
                  </span>
                </div>

                {/* Service Details */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate2-500">Service Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Package className="h-5 w-5 text-slate2-400 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate2-900">{order.serviceName}</p>
                          <p className="text-sm text-slate2-600">{order.subService}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-slate2-400" />
                        <div>
                          <p className="text-sm text-slate2-600">Date & Time</p>
                          <p className="font-semibold text-slate2-900">{order.bookingDate} at {order.timeSlot}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-slate2-400" />
                        <div>
                          <p className="text-sm text-slate2-600">Service Address</p>
                          <p className="font-semibold text-slate2-900">{order.customerAddress}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate2-500">Customer Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-slate2-400" />
                        <div>
                          <p className="text-sm text-slate2-600">Customer Name</p>
                          <p className="font-semibold text-slate2-900">{order.customerName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-slate2-400" />
                        <div>
                          <p className="text-sm text-slate2-600">Contact Number</p>
                          <p className="font-semibold text-slate2-900">{order.customerPhone}</p>
                        </div>
                      </div>
                      {order.workerName && (
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-brand-600" />
                          <div>
                            <p className="text-sm text-slate2-600">Assigned Worker</p>
                            <p className="font-semibold text-slate2-900">{order.workerName}</p>
                            {order.workerPhone && (
                              <p className="text-sm text-brand-600">{order.workerPhone}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate2-200">
                  <p className="text-sm text-slate2-600">Total Amount</p>
                  <p className="text-2xl font-black text-brand-600">₹{order.amount.toLocaleString("en-IN")}</p>
                </div>
              </div>

              {/* Tracking Timeline */}
              <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
                <h3 className="mb-6 text-lg font-black text-slate2-900">Tracking Timeline</h3>
                <div className="space-y-4">
                  {getTrackingSteps(order.tracking.status).map((step, index) => (
                    <div key={step.key} className="flex items-start gap-4">
                      <div className="relative">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
                            step.completed
                              ? "bg-brand-600 text-white"
                              : step.current
                              ? "bg-brand-100 text-brand-600 border-2 border-brand-600"
                              : "bg-slate2-200 text-slate2-400"
                          }`}
                        >
                          <step.icon className="h-5 w-5" />
                        </div>
                        {index < getTrackingSteps(order.tracking.status).length - 1 && (
                          <div
                            className={`absolute top-10 left-5 h-16 w-0.5 -translate-x-1/2 ${
                              step.completed ? "bg-brand-600" : "bg-slate2-200"
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`font-semibold ${
                            step.current ? "text-brand-600" : step.completed ? "text-slate2-900" : "text-slate2-500"
                          }`}
                        >
                          {step.label}
                        </p>
                        {step.current && (
                          <p className="mt-1 text-sm text-slate2-600">
                            {new Date(order.tracking.timestamp).toLocaleString("en-IN")}
                          </p>
                        )}
                        {step.completed && step.key === order.tracking.status && (
                          <p className="mt-1 text-xs text-slate2-500">
                            {new Date(order.tracking.timestamp).toLocaleString("en-IN")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Estimated Arrival */}
                {order.tracking.estimatedArrival && (
                  <div className="mt-6 rounded-xl bg-brand-50 p-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-brand-600" />
                      <div>
                        <p className="text-sm font-semibold text-brand-600">Estimated Arrival</p>
                        <p className="text-sm text-slate2-700">{order.tracking.estimatedArrival}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
