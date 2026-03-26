"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockKeyhole, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Login failed");
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,_#dbeafe_0,_#eff6ff_35,_#f8fafc_100%)] p-4">
      <div className="w-full max-w-lg rounded-3xl border border-white/50 bg-white/85 p-8 shadow-2xl shadow-slate-200/60 backdrop-blur">
        <div className="mb-6 flex items-center gap-3">
          <span className="rounded-xl bg-blue-100 p-3 text-blue-700">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">ServiceHub Admin</p>
            <h1 className="font-display text-3xl font-bold text-slate-900">Admin Login</h1>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@servicehub.com"
              className="w-full bg-transparent text-sm text-slate-900 outline-none"
              required
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="w-full bg-transparent text-sm text-slate-900 outline-none"
              required
            />
          </div>

          {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:from-blue-700 hover:to-cyan-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <LockKeyhole className="h-4 w-4" />
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between text-sm">
          <Link href="/" className="text-slate-600 hover:text-slate-900">
            Back To Home
          </Link>
          <Link href="/admin/signup" className="font-semibold text-blue-700 hover:text-blue-800">
            Create First Admin
          </Link>
        </div>
      </div>
    </main>
  );
}

