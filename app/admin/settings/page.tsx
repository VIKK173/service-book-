"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Settings as SettingsIcon,
  Store,
  Bell,
  CreditCard,
  Users,
  Briefcase,
  Truck,
  Percent,
  Globe,
  Mail,
  Phone,
  MapPin,
  Clock,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Moon,
  Sun,
} from "lucide-react";

type SettingsSection = "general" | "appearance" | "services" | "notifications" | "payments" | "workers" | "system";

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("general");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // Dark Mode
  const [darkMode, setDarkMode] = useState(false);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("admin-dark-mode", String(newMode));
  };

  // Load dark mode preference on mount
  useEffect(() => {
    const saved = localStorage.getItem("admin-dark-mode");
    if (saved === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // General Settings
  const [siteName, setSiteName] = useState("ServiceHub");
  const [siteTagline, setSiteTagline] = useState("Home Services at Your Doorstep");
  const [contactEmail, setContactEmail] = useState("support@servicehub.in");
  const [contactPhone, setContactPhone] = useState("+91 9876543210");
  const [address, setAddress] = useState("Ranchi, Jharkhand, India");
  const [businessHours, setBusinessHours] = useState("9:00 AM - 8:00 PM");

  // Service Settings
  const [serviceCategories] = useState([
    { id: 1, name: "Cleaning", active: true, commission: 15 },
    { id: 2, name: "Plumbing", active: true, commission: 12 },
    { id: 3, name: "Electrical", active: true, commission: 12 },
    { id: 4, name: "AC Repair", active: true, commission: 18 },
    { id: 5, name: "Painting", active: true, commission: 10 },
    { id: 6, name: "Carpentry", active: true, commission: 12 },
    { id: 7, name: "Pest Control", active: true, commission: 15 },
    { id: 8, name: "Appliance Repair", active: true, commission: 14 },
  ]);

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [notifyNewBooking, setNotifyNewBooking] = useState(true);
  const [notifyCancellation, setNotifyCancellation] = useState(true);
  const [notifyCompletion, setNotifyCompletion] = useState(true);

  // Payment Settings
  const [platformFee, setPlatformFee] = useState(5);
  const [minBookingAmount, setMinBookingAmount] = useState(199);
  const [paymentMethods, setPaymentMethods] = useState({
    upi: true,
    card: true,
    cod: false,
    netbanking: true,
  });

  // Worker Settings
  const [workerVerification, setWorkerVerification] = useState(true);
  const [autoAssignWorkers, setAutoAssignWorkers] = useState(true);
  const [workerRatingThreshold, setWorkerRatingThreshold] = useState(4.0);

  // System Settings
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState("daily");

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise((r) => setTimeout(r, 1500));
    setSaving(false);
    showToast("Settings saved successfully!");
  };

  const sections = [
    { id: "general", label: "General", icon: Store },
    { id: "appearance", label: "Appearance", icon: Moon },
    { id: "services", label: "Services", icon: Briefcase },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "workers", label: "Workers", icon: Truck },
    { id: "system", label: "System", icon: SettingsIcon },
  ];

  return (
    <main className="min-h-screen bg-slate2-50 text-slate2-900">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-xl ${
            toast.ok ? "bg-brand-600" : "bg-rose-600"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-slate2-200 bg-white/95 px-6 py-4 backdrop-blur">
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 text-sm font-semibold text-slate2-600 hover:text-brand-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 p-2 text-white">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate2-900">Settings</h1>
                <p className="text-xs text-slate2-500">Manage platform configuration</p>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </header>

        <div className="flex gap-6 p-6">
          {/* Sidebar Navigation */}
          <aside className="w-64 shrink-0">
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id as SettingsSection)}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      activeSection === section.id
                        ? "bg-brand-500 text-white shadow-lg shadow-brand-500/30"
                        : "text-slate2-600 hover:bg-brand-50 hover:text-brand-600"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content Area */}
          <div className="flex-1">
            {/* General Settings */}
            {activeSection === "general" && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
                  <h2 className="text-2xl font-black text-slate2-900">Business Information</h2>
                  <p className="mt-1 text-sm text-slate2-500">Basic details about your service platform</p>

                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate2-700">Site Name</label>
                      <input
                        type="text"
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        className="w-full rounded-xl border border-slate2-200 bg-slate2-50 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate2-700">Tagline</label>
                      <input
                        type="text"
                        value={siteTagline}
                        onChange={(e) => setSiteTagline(e.target.value)}
                        className="w-full rounded-xl border border-slate2-200 bg-slate2-50 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
                  <h2 className="text-2xl font-black text-slate2-900">Contact Details</h2>
                  <p className="mt-1 text-sm text-slate2-500">How customers can reach you</p>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate2-700">
                        <Mail className="h-4 w-4" /> Email Address
                      </label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full rounded-xl border border-slate2-200 bg-slate2-50 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate2-700">
                        <Phone className="h-4 w-4" /> Phone Number
                      </label>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full rounded-xl border border-slate2-200 bg-slate2-50 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate2-700">
                        <MapPin className="h-4 w-4" /> Business Address
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full rounded-xl border border-slate2-200 bg-slate2-50 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate2-700">
                        <Clock className="h-4 w-4" /> Business Hours
                      </label>
                      <input
                        type="text"
                        value={businessHours}
                        onChange={(e) => setBusinessHours(e.target.value)}
                        className="w-full rounded-xl border border-slate2-200 bg-slate2-50 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeSection === "appearance" && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
                  <h2 className="text-2xl font-black text-slate2-900">Theme Settings</h2>
                  <p className="mt-1 text-sm text-slate2-500">Customize the appearance of your admin panel</p>

                  <div className="mt-6 space-y-4">
                    {/* Dark Mode Toggle */}
                    <div className="flex items-center justify-between rounded-xl border border-slate2-200 bg-slate2-50 px-4 py-4">
                      <div className="flex items-center gap-3">
                        {darkMode ? (
                          <Moon className="h-5 w-5 text-brand-600" />
                        ) : (
                          <Sun className="h-5 w-5 text-accent-500" />
                        )}
                        <div>
                          <p className="text-sm font-semibold text-slate2-700">Dark Mode</p>
                          <p className="text-xs text-slate2-500">
                            {darkMode ? "Dark theme is active" : "Light theme is active"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={toggleDarkMode}
                        className={`relative h-7 w-14 rounded-full transition-colors ${
                          darkMode ? "bg-brand-600" : "bg-slate2-300"
                        }`}
                      >
                        <div
                          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                            darkMode ? "left-8" : "left-1"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Theme Preview */}
                    <div className="rounded-xl border border-slate2-200 p-4">
                      <p className="mb-3 text-sm font-semibold text-slate2-700">Preview</p>
                      <div className={`rounded-lg p-4 ${darkMode ? "bg-slate2-800" : "bg-slate2-100"}`}>
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-lg ${darkMode ? "bg-brand-500" : "bg-brand-600"}`} />
                          <div className="flex-1 space-y-2">
                            <div className={`h-3 w-3/4 rounded ${darkMode ? "bg-slate2-600" : "bg-slate2-300"}`} />
                            <div className={`h-2 w-1/2 rounded ${darkMode ? "bg-slate2-700" : "bg-slate2-200"}`} />
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <div className={`h-8 w-20 rounded-lg ${darkMode ? "bg-brand-500" : "bg-brand-600"}`} />
                          <div className={`h-8 w-20 rounded-lg ${darkMode ? "bg-slate2-700" : "bg-slate2-200"}`} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
                  <h2 className="text-2xl font-black text-slate2-900">Color Preferences</h2>
                  <p className="mt-1 text-sm text-slate2-500">Choose your accent color</p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {[
                      { name: "Brand", color: "bg-brand-500", ring: "ring-brand-300" },
                      { name: "Accent", color: "bg-accent-500", ring: "ring-accent-300" },
                      { name: "Emerald", color: "bg-emerald-500", ring: "ring-emerald-300" },
                      { name: "Violet", color: "bg-violet-500", ring: "ring-violet-300" },
                      { name: "Rose", color: "bg-rose-500", ring: "ring-rose-300" },
                      { name: "Cyan", color: "bg-cyan-500", ring: "ring-cyan-300" },
                    ].map((theme) => (
                      <button
                        key={theme.name}
                        className={`h-12 w-12 rounded-xl ${theme.color} ring-2 ring-offset-2 transition hover:scale-110 ${
                          theme.name === "Brand" ? theme.ring : "ring-transparent"
                        }`}
                        title={theme.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Services Settings */}
            {activeSection === "services" && (
              <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-black text-slate2-900">Service Categories</h2>
                <p className="mt-1 text-sm text-slate2-500">Manage service categories and commission rates</p>

                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate2-200 text-xs font-bold uppercase tracking-wider text-slate2-500">
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Commission (%)</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate2-100">
                      {serviceCategories.map((cat) => (
                        <tr key={cat.id} className="text-sm">
                          <td className="px-4 py-4 font-semibold text-slate2-800">{cat.name}</td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                                cat.active
                                  ? "bg-brand-100 text-brand-700"
                                  : "bg-slate2-100 text-slate2-600"
                              }`}
                            >
                              {cat.active ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                              {cat.active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1">
                              <Percent className="h-3 w-3 text-slate2-400" />
                              <span className="font-semibold">{cat.commission}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <button className="rounded-lg bg-slate2-100 px-3 py-1.5 text-xs font-semibold text-slate2-600 hover:bg-brand-50 hover:text-brand-600">
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeSection === "notifications" && (
              <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-black text-slate2-900">Notification Preferences</h2>
                <p className="mt-1 text-sm text-slate2-500">Configure how you receive alerts and updates</p>

                <div className="mt-6 space-y-6">
                  <div>
                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate2-500">Channels</h3>
                    <div className="space-y-3">
                      {[
                        { label: "Email Notifications", value: emailNotifications, setter: setEmailNotifications },
                        { label: "SMS Notifications", value: smsNotifications, setter: setSmsNotifications },
                        { label: "Push Notifications", value: pushNotifications, setter: setPushNotifications },
                      ].map((item, i) => (
                        <label key={i} className="flex cursor-pointer items-center justify-between rounded-xl border border-slate2-200 bg-slate2-50 px-4 py-3 hover:bg-slate2-100">
                          <span className="text-sm font-semibold text-slate2-700">{item.label}</span>
                          <div
                            onClick={() => item.setter(!item.value)}
                            className={`relative h-6 w-11 rounded-full transition ${
                              item.value ? "bg-brand-600" : "bg-slate2-300"
                            }`}
                          >
                            <div
                              className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                                item.value ? "left-6" : "left-1"
                              }`}
                            />
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate2-500">Alert Types</h3>
                    <div className="space-y-3">
                      {[
                        { label: "New Booking Alerts", value: notifyNewBooking, setter: setNotifyNewBooking },
                        { label: "Cancellation Alerts", value: notifyCancellation, setter: setNotifyCancellation },
                        { label: "Service Completion Alerts", value: notifyCompletion, setter: setNotifyCompletion },
                      ].map((item, i) => (
                        <label key={i} className="flex cursor-pointer items-center justify-between rounded-xl border border-slate2-200 bg-slate2-50 px-4 py-3 hover:bg-slate2-100">
                          <span className="text-sm font-semibold text-slate2-700">{item.label}</span>
                          <div
                            onClick={() => item.setter(!item.value)}
                            className={`relative h-6 w-11 rounded-full transition ${
                              item.value ? "bg-brand-600" : "bg-slate2-300"
                            }`}
                          >
                            <div
                              className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                                item.value ? "left-6" : "left-1"
                              }`}
                            />
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payments Settings */}
            {activeSection === "payments" && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
                  <h2 className="text-2xl font-black text-slate2-900">Pricing & Fees</h2>
                  <p className="mt-1 text-sm text-slate2-500">Configure platform fees and minimum amounts</p>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate2-700">Platform Fee (%)</label>
                      <input
                        type="number"
                        value={platformFee}
                        onChange={(e) => setPlatformFee(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate2-200 bg-slate2-50 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate2-700">Minimum Booking Amount (₹)</label>
                      <input
                        type="number"
                        value={minBookingAmount}
                        onChange={(e) => setMinBookingAmount(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate2-200 bg-slate2-50 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate2-200 bg-white p-6 shadow-sm">
                  <h2 className="text-2xl font-black text-slate2-900">Payment Methods</h2>
                  <p className="mt-1 text-sm text-slate2-500">Enable or disable payment options</p>

                  <div className="mt-6 space-y-3">
                    {[
                      { key: "upi", label: "UPI Payment", value: paymentMethods.upi },
                      { key: "card", label: "Credit/Debit Card", value: paymentMethods.card },
                      { key: "cod", label: "Cash on Delivery", value: paymentMethods.cod },
                      { key: "netbanking", label: "Net Banking", value: paymentMethods.netbanking },
                    ].map((item) => (
                      <label key={item.key} className="flex cursor-pointer items-center justify-between rounded-xl border border-slate2-200 bg-slate2-50 px-4 py-3 hover:bg-slate2-100">
                        <span className="text-sm font-semibold text-slate2-700">{item.label}</span>
                        <div
                          onClick={() =>
                            setPaymentMethods((prev) => ({
                              ...prev,
                              [item.key]: !prev[item.key as keyof typeof prev],
                            }))
                          }
                          className={`relative h-6 w-11 rounded-full transition ${
                            item.value ? "bg-brand-600" : "bg-slate2-300"
                          }`}
                        >
                          <div
                            className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                              item.value ? "left-6" : "left-1"
                            }`}
                          />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Workers Settings */}
            {activeSection === "workers" && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900">Worker Management</h2>
                <p className="mt-1 text-sm text-slate-500">Configure worker-related settings</p>

                <div className="mt-6 space-y-4">
                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 hover:bg-slate-100">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Worker Verification Required</p>
                      <p className="text-xs text-slate-500">Workers must be verified before accepting jobs</p>
                    </div>
                    <div
                      onClick={() => setWorkerVerification(!workerVerification)}
                      className={`relative h-6 w-11 rounded-full transition ${
                        workerVerification ? "bg-indigo-600" : "bg-slate-300"
                      }`}
                    >
                      <div
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          workerVerification ? "left-6" : "left-1"
                        }`}
                      />
                    </div>
                  </label>

                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 hover:bg-slate-100">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Auto-Assign Workers</p>
                      <p className="text-xs text-slate-500">Automatically assign available workers to new bookings</p>
                    </div>
                    <div
                      onClick={() => setAutoAssignWorkers(!autoAssignWorkers)}
                      className={`relative h-6 w-11 rounded-full transition ${
                        autoAssignWorkers ? "bg-indigo-600" : "bg-slate-300"
                      }`}
                    >
                      <div
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          autoAssignWorkers ? "left-6" : "left-1"
                        }`}
                      />
                    </div>
                  </label>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                      Minimum Worker Rating Threshold
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={workerRatingThreshold}
                      onChange={(e) => setWorkerRatingThreshold(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
                    />
                    <p className="mt-1 text-xs text-slate-500">Workers below this rating will be flagged</p>
                  </div>
                </div>
              </div>
            )}

            {/* System Settings */}
            {activeSection === "system" && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900">System Configuration</h2>
                <p className="mt-1 text-sm text-slate-500">Advanced system settings and maintenance</p>

                <div className="mt-6 space-y-4">
                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 hover:bg-rose-100">
                    <div>
                      <p className="text-sm font-semibold text-rose-700">Maintenance Mode</p>
                      <p className="text-xs text-rose-600">Temporarily disable the platform for maintenance</p>
                    </div>
                    <div
                      onClick={() => setMaintenanceMode(!maintenanceMode)}
                      className={`relative h-6 w-11 rounded-full transition ${
                        maintenanceMode ? "bg-rose-600" : "bg-slate-300"
                      }`}
                    >
                      <div
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          maintenanceMode ? "left-6" : "left-1"
                        }`}
                      />
                    </div>
                  </label>

                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 hover:bg-amber-100">
                    <div>
                      <p className="text-sm font-semibold text-amber-700">Debug Mode</p>
                      <p className="text-xs text-amber-600">Enable detailed logging for troubleshooting</p>
                    </div>
                    <div
                      onClick={() => setDebugMode(!debugMode)}
                      className={`relative h-6 w-11 rounded-full transition ${
                        debugMode ? "bg-amber-600" : "bg-slate-300"
                      }`}
                    >
                      <div
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          debugMode ? "left-6" : "left-1"
                        }`}
                      />
                    </div>
                  </label>

                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 hover:bg-slate-100">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Auto Backup</p>
                      <p className="text-xs text-slate-500">Automatically backup database</p>
                    </div>
                    <div
                      onClick={() => setAutoBackup(!autoBackup)}
                      className={`relative h-6 w-11 rounded-full transition ${
                        autoBackup ? "bg-indigo-600" : "bg-slate-300"
                      }`}
                    >
                      <div
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          autoBackup ? "left-6" : "left-1"
                        }`}
                      />
                    </div>
                  </label>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Backup Frequency</label>
                    <select
                      value={backupFrequency}
                      onChange={(e) => setBackupFrequency(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
