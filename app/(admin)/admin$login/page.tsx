"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [fields, setFields] = useState({ operatorId: "", passkey: "" });
  const [showPass, setShowPass] = useState(false);
  const [trusted, setTrusted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  // TODO: wire to your admin auth logic (BetterAuth admin plugin / custom JWT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fields.operatorId || !fields.passkey) {
      setError("ALL FIELDS REQUIRED");
      return;
    }
    setLoading(true);
    // await adminAuth.signIn({ id: fields.operatorId, passkey: fields.passkey })
    await new Promise((r) => setTimeout(r, 1500)); // placeholder delay
    setLoading(false);
    setError("ACCESS DENIED — INVALID CREDENTIALS"); // placeholder
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">

      {/* Background scanlines */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 4px)",
        }}
      />

      {/* Faint grid */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,80,0,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,80,0,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Corner accents */}
      <div className="fixed top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-orange-500/20 pointer-events-none z-0" />
      <div className="fixed top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-orange-500/20 pointer-events-none z-0" />
      <div className="fixed bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-orange-500/20 pointer-events-none z-0" />
      <div className="fixed bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-orange-500/20 pointer-events-none z-0" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm border border-orange-500/40 bg-[#0f0f0f] p-7 flex flex-col gap-6 shadow-[0_0_60px_rgba(255,80,0,0.08)]">

        {/* Top border glow */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent" />

        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-dm-mono text-sm font-medium tracking-[0.2em] text-orange-400 uppercase">
              RKS_ADMIN
            </span>
            {/* Status indicator */}
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              <span className="font-dm-mono text-[0.6rem] tracking-widest text-orange-500/60 uppercase">Live</span>
            </div>
          </div>

          {/* Warning badge */}
          <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 px-3 py-1.5 w-fit">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span className="font-dm-mono text-[0.6rem] tracking-[0.18em] text-orange-400 uppercase">
              Admin Access Only
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

          {/* Operator ID */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="operatorId" className="font-dm-mono text-[0.62rem] tracking-[0.18em] text-white/30 uppercase">
              Operator_ID
            </label>
            <div className="relative flex items-center">
              <input
                id="operatorId"
                name="operatorId"
                type="text"
                placeholder="SEC_ALPHA_####"
                value={fields.operatorId}
                onChange={handleChange}
                autoComplete="off"
                spellCheck={false}
                className="w-full bg-[#141414] border border-white/8 px-4 py-3 font-dm-mono text-sm text-white placeholder:text-white/15 outline-none transition-all focus:border-orange-500/60 focus:bg-[#161616] focus:shadow-[0_0_0_1px_rgba(249,115,22,0.2)] tracking-wider"
              />
              {/* Lock icon */}
              <span className="absolute right-3.5 text-white/15">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="1"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
            </div>
          </div>

          {/* Passkey */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="passkey" className="font-dm-mono text-[0.62rem] tracking-[0.18em] text-white/30 uppercase">
              Encrypted_Passkey
            </label>
            <div className="relative flex items-center">
              <input
                id="passkey"
                name="passkey"
                type={showPass ? "text" : "password"}
                placeholder="••••••••••••"
                value={fields.passkey}
                onChange={handleChange}
                autoComplete="current-password"
                className="w-full bg-[#141414] border border-white/8 px-4 py-3 pr-11 font-dm-mono text-sm text-white placeholder:text-white/15 outline-none transition-all focus:border-orange-500/60 focus:bg-[#161616] focus:shadow-[0_0_0_1px_rgba(249,115,22,0.2)] tracking-wider"
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-3.5 text-white/20 hover:text-orange-400/60 transition-colors"
              >
                {showPass ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-500/8 border border-red-500/25">
              <span className="w-1 h-1 rounded-full bg-red-500 shrink-0" />
              <span className="font-dm-mono text-[0.62rem] tracking-widest text-red-400 uppercase">{error}</span>
            </div>
          )}

          {/* Trust terminal + Recover */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div
                onClick={() => setTrusted((p) => !p)}
                className={`w-3.5 h-3.5 border transition-all cursor-pointer flex items-center justify-center ${
                  trusted ? "border-orange-500 bg-orange-500" : "border-white/20 group-hover:border-white/40"
                }`}
              >
                {trusted && (
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </div>
              <span className="font-dm-mono text-[0.62rem] tracking-widest text-white/25 uppercase group-hover:text-white/40 transition-colors">
                Trust_Terminal
              </span>
            </label>
            {/* TODO: wire to admin password recovery */}
            <button type="button" className="font-dm-mono text-[0.62rem] tracking-widest text-orange-500/50 uppercase hover:text-orange-400 transition-colors">
              Recover_ID
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="relative w-full py-3.5 mt-1 bg-orange-500 text-black font-dm-mono text-xs font-medium tracking-[0.2em] uppercase transition-all hover:bg-orange-400 hover:shadow-[0_0_24px_rgba(249,115,22,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 overflow-hidden group"
          >
            {/* Shimmer on hover */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                Authorize_Session
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500/40" />
            <span className="font-dm-mono text-[0.58rem] tracking-widest text-white/15 uppercase">#RKS_CONSOLE</span>
          </div>
          <span className="font-dm-mono text-[0.58rem] tracking-widest text-white/15 uppercase">
            Protocol_Sentinel_v1
          </span>
        </div>

        {/* Bottom message */}
        <p className="text-center font-dm-mono text-[0.55rem] tracking-[0.2em] text-white/10 uppercase -mt-2">
          Authentication Required For Panel Access //
        </p>
      </div>
    </main>
  );
}