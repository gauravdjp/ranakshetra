"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";



export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [fields, setFields] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await authClient.signIn.email({
        email: fields.email,
        password: fields.password,
      });
      console.log("data:", data);       
      console.log("authError:", authError);
      if (authError) {
        setError(authError.message || "Invalid email or password");
        return;
      }

      const role = data.user.role as string;
      console.log("role:", role);
      const userId = data.user.id;

      const redirectMap: Record<string, string> = {
        player:      `/playerhp/${userId}`,
        organiser:   `/arenahp/${userId}`,
        club_leader: `/clubhp/${userId}`,
        admin:       "/admin",
      };

      router.push(redirectMap[role] ?? "/");
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0d0d0f] text-white flex relative overflow-hidden">

      {/* ── Background glows ── */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-violet-600 opacity-10 blur-[100px] -top-32 -left-20 animate-pulse" />
        <div className="absolute w-[350px] h-[350px] rounded-full bg-pink-600 opacity-8 blur-[100px] -bottom-20 left-[40%]" />
        <div className="absolute w-[280px] h-[280px] rounded-full bg-cyan-500 opacity-5 blur-[100px] top-[40%] -right-16" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(rgba(124,111,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,111,255,0.04) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      {/* ── Left branding panel ── */}
      <aside className="hidden lg:flex relative z-10 w-1/2 flex-col justify-center px-16 border-r border-white/5 overflow-hidden">
        <div className="flex flex-col gap-12 relative z-10">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="text-3xl text-violet-400 drop-shadow-[0_0_12px_rgba(124,111,255,0.6)]">⚔</span>
            <span className="font-dm-mono text-sm tracking-[0.28em] text-white/40 uppercase">Ranakshetra</span>
          </div>

          {/* Tagline */}
          <div className="flex flex-col gap-1">
            <span className="font-outfit text-5xl font-bold tracking-wide text-white leading-tight">COMPETE.</span>
            <span className="font-outfit text-5xl font-bold tracking-wide text-violet-400 leading-tight drop-shadow-[0_0_40px_rgba(124,111,255,0.4)]">CONQUER.</span>
            <span className="font-outfit text-xl font-medium tracking-[0.15em] text-white/30 mt-1">CLAIM YOUR LEGACY.</span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-7">
            {[
              { num: "12K+", label: "Players" },
              { num: "340+", label: "Tournaments" },
              { num: "80+", label: "Clubs" },
            ].map((s, i, arr) => (
              <div key={s.label} className="flex items-center gap-7">
                <div className="flex flex-col gap-1">
                  <span className="font-dm-mono text-2xl text-white">{s.num}</span>
                  <span className="text-xs tracking-widest text-white/30 uppercase">{s.label}</span>
                </div>
                {i < arr.length - 1 && <div className="w-px h-9 bg-white/10" />}
              </div>
            ))}
          </div>
        </div>

        {/* Decorative rings */}
        <div className="absolute -bottom-32 -right-32 pointer-events-none">
          <div className="absolute w-80 h-80 rounded-full border border-violet-500/10" />
          <div className="absolute w-56 h-56 rounded-full border border-violet-500/7 top-12 left-12" />
          <div className="absolute w-32 h-32 rounded-full border border-violet-500/5 top-24 left-24" />
        </div>
      </aside>

      {/* ── Right login panel ── */}
      <section className="relative z-10 flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm flex flex-col gap-7">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 pb-2">
            <span className="text-2xl text-violet-400">⚔</span>
            <span className="font-dm-mono text-sm tracking-[0.22em] text-white/40 uppercase">Ranakshetra</span>
          </div>

          {/* Header */}
          <div className="flex flex-col gap-2">
            <p className="font-dm-mono text-[0.68rem] tracking-[0.2em] text-violet-400 uppercase">Welcome Back, Warrior</p>
            <h1 className="font-outfit text-4xl font-bold tracking-wide text-white leading-none">Sign In</h1>
            <p className="text-sm text-white/40 leading-relaxed mt-1">Access your command center and continue your journey.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            {/* Error message */}
            {error && (
              <div role="alert" className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 text-center">
                {error}
              </div>
            )}
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="font-dm-mono text-[0.68rem] tracking-[0.14em] text-white/30 uppercase">
                Email Address
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-white/25 pointer-events-none">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="operator@legacy.com"
                  value={fields.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition-all focus:border-violet-500 focus:bg-white/7 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="font-dm-mono text-[0.68rem] tracking-[0.14em] text-white/30 uppercase">
                  Password
                </label>
                {/* TODO: wire to forgot password route */}
                <Link href="/forgot-password" className="text-xs text-white/30 hover:text-violet-400 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-white/25 pointer-events-none">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••"
                  value={fields.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-11 py-3 text-sm text-white placeholder:text-white/20 outline-none transition-all focus:border-violet-500 focus:bg-white/7 focus:ring-2 focus:ring-violet-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 text-white/25 hover:text-white/50 transition-colors"
                >
                  {showPassword ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !fields.email || !fields.password}
              className="flex items-center justify-center gap-2.5 w-full py-3.5 mt-1 bg-white text-[#0d0d0f] rounded-lg font-dm-mono text-xs font-bold tracking-[0.12em] uppercase transition-all hover:bg-violet-400 hover:text-white hover:shadow-[0_4px_20px_rgba(124,111,255,0.35)] hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:bg-white disabled:hover:text-[#0d0d0f]"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Enter the Arena
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>

          </form>

          {/* Sign up CTA */}
          <p className="text-center text-sm text-white/25">
            New to Ranakshetra?{" "}
            <Link href="/signup" className="text-violet-400 hover:text-violet-300 transition-colors font-medium">
              Create your account →
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}