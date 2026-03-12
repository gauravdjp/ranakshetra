"use client";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focused, setFocused] = useState<string | null>(null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1; }
        }
        @keyframes gridFade {
          from { opacity: 0; }
          to   { opacity: 0.03; }
        }
        @keyframes borderGlow {
          0%, 100% { box-shadow: 0 0 0px rgba(139,92,246,0); }
          50%       { box-shadow: 0 0 20px rgba(139,92,246,0.3); }
        }

        .login-fade-1 { animation: fadeUp 0.7s ease forwards; animation-delay: 0.1s; opacity: 0; }
        .login-fade-2 { animation: fadeUp 0.7s ease forwards; animation-delay: 0.25s; opacity: 0; }
        .login-fade-3 { animation: fadeUp 0.7s ease forwards; animation-delay: 0.4s; opacity: 0; }
        .login-fade-4 { animation: fadeUp 0.7s ease forwards; animation-delay: 0.55s; opacity: 0; }
        .login-fade-5 { animation: fadeUp 0.7s ease forwards; animation-delay: 0.7s; opacity: 0; }

        .anim-grid { animation: gridFade 2s ease forwards; }

        /* Input focus glow */
        .rk-input:focus {
          outline: none;
          border-color: rgba(139,92,246,0.7);
          box-shadow: 0 0 20px rgba(139,92,246,0.15), inset 0 0 10px rgba(139,92,246,0.03);
        }

        /* Diagonal-cut button */
        .rk-btn-primary {
          clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
          background: linear-gradient(135deg, #a78bfa, #8b5cf6);
          transition: all 0.3s ease;
        }
        .rk-btn-primary:hover {
          box-shadow: 0 0 30px rgba(139,92,246,0.6);
          transform: translateY(-1px);
        }

        /* Guest button */
        .rk-btn-ghost {
          clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
          transition: all 0.3s ease;
        }
        .rk-btn-ghost:hover {
          background: rgba(139,92,246,0.08);
          border-color: rgba(139,92,246,0.5);
        }

        /* Card corner brackets — same as landing page */
        .rk-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 32px; height: 32px;
          border-top: 1.5px solid rgba(139,92,246,0.6);
          border-left: 1.5px solid rgba(139,92,246,0.6);
        }
        .rk-card::after {
          content: '';
          position: absolute;
          bottom: 0; right: 0;
          width: 32px; height: 32px;
          border-bottom: 1.5px solid rgba(139,92,246,0.6);
          border-right: 1.5px solid rgba(139,92,246,0.6);
        }

        /* Divider line with text */
        .rk-divider {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .rk-divider::before,
        .rk-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.2), transparent);
        }
      `}</style>

      <div className="min-h-screen bg-[#050510] flex items-center justify-center px-4 py-16 relative overflow-hidden">

        {/* Background grid */}
        <div className="anim-grid absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(139,92,246,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.7) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }}
        />

        {/* Radial vignette */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 0%, #050510 70%)" }}
        />

        {/* Cyan glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(139,92,246,0.1) 0%, transparent 70%)" }}
        />

        {/* Card */}
        <div className="rk-card relative w-full max-w-[420px] bg-[rgba(255,255,255,0.02)] border border-[rgba(139,92,246,0.2)] p-8 md:p-10">

          {/* Logo / title */}
          <div className="login-fade-1 text-center mb-8">
            <p className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.4em] uppercase text-[#8b5cf6] mb-2">
              Enter the Arena
            </p>
            <h1 className="font-[Cinzel,serif] font-black text-white tracking-[0.05em]"
              style={{
                fontSize: "clamp(1.8rem, 5vw, 2.4rem)",
                background: "linear-gradient(135deg, #fff 0%, #a78bfa 40%, #8b5cf6 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
              }}>
              Ranakshetra
            </h1>
            <p className="font-[Rajdhani,sans-serif] text-[0.8rem] text-white/35 mt-2 tracking-wide">
              Sign in to your account
            </p>
          </div>

          {/* Email input */}
          <div className="login-fade-2 mb-4">
            <label className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.3em] uppercase text-[#8b5cf6] block mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
              placeholder="warrior@arena.com"
              className="rk-input w-full bg-[rgba(139,92,246,0.04)] border border-[rgba(139,92,246,0.2)] text-white/80 font-[Rajdhani,sans-serif] text-[0.9rem] px-4 py-3 placeholder:text-white/20 transition-all duration-300"
              style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
            />
          </div>

          {/* Password input */}
          <div className="login-fade-3 mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.3em] uppercase text-[#8b5cf6]">
                Password
              </label>
              <a href="#" className="font-[Rajdhani,sans-serif] text-[0.65rem] text-white/30 hover:text-[#8b5cf6] transition-colors duration-200 tracking-wide">
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused(null)}
              placeholder="••••••••"
              className="rk-input w-full bg-[rgba(139,92,246,0.04)] border border-[rgba(139,92,246,0.2)] text-white/80 font-[Rajdhani,sans-serif] text-[0.9rem] px-4 py-3 placeholder:text-white/20 transition-all duration-300"
              style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
            />
          </div>

          {/* Sign in button */}
          <div className="login-fade-4 space-y-3">
            <button className="rk-btn-primary w-full py-3 font-[Rajdhani,sans-serif] font-bold text-[0.9rem] tracking-[0.2em] uppercase text-white">
              Enter the Battle
            </button>

            {/* Divider */}
            <div className="rk-divider my-4">
              <span className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.2em] uppercase text-white/25">or</span>
            </div>

            {/* Guest access */}
            <Link href="/"
              className="rk-btn-ghost w-full py-3 font-[Rajdhani,sans-serif] font-semibold text-[0.9rem] tracking-[0.2em] uppercase text-white/40 border border-[rgba(139,92,246,0.2)] flex items-center justify-center gap-2 no-underline">
              {/* Eye icon — represents "just watching" */}
              <svg viewBox="0 0 20 14" fill="none" className="w-4 h-4 opacity-50">
                <path d="M1 7C1 7 4 1 10 1C16 1 19 7 19 7C19 7 16 13 10 13C4 13 1 7 1 7Z" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="10" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              Continue as Guest
            </Link>
          </div>

          {/* Sign up link */}
          <div className="login-fade-5 mt-8 text-center">
            <p className="font-[Rajdhani,sans-serif] text-[0.8rem] text-white/30">
              New to the battlefield?{" "}
              <Link href="/sign-up" className="text-[#a78bfa] hover:text-white transition-colors duration-200 font-semibold no-underline">
                Create Account
              </Link>
            </p>
          </div>

        </div>
      </div>
    </>
  );
}