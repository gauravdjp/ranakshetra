"use client";
import { useState } from "react";
import Link from "next/link";
import { Access_Level_USER_Role, Basic_Info, Games, Player} from "../../../types/index";
import { SubmitHandler, useForm, Controller, set } from "react-hook-form";


type Step = "role" | "basic" | "details" | "done";

// ── Step progress bar
function StepBar({ step }: { step: Step }) {
  const steps: Step[] = ["role", "basic", "details", "done"];
  const idx = steps.indexOf(step);
  return (
    <div className="flex items-center gap-2 mb-8">
      {[Access_Level_USER_Role.PLAYER, "Basic Info", "Details"].map((label, i) => (
        <div key={label} className="flex items-center gap-2 flex-1">
          <div className="flex flex-col items-center gap-1">
            <div
              className="w-6 h-6 flex items-center justify-center border text-[0.6rem] font-bold font-[Rajdhani,sans-serif]"
              style={{
                borderColor: i <= idx - 1 ? "#8b5cf6" : i === idx ? "rgba(139,92,246,0.8)" : "rgba(139,92,246,0.2)",
                background: i < idx ? "rgba(139,92,246,0.3)" : "transparent",
                color: i < idx ? "#a78bfa" : i === idx ? "white" : "rgba(255,255,255,0.25)",
                clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)",
              }}
            >
              {i < idx ? "✓" : i + 1}
            </div>
            <span
              className="font-[Rajdhani,sans-serif] text-[0.5rem] tracking-[0.2em] uppercase whitespace-nowrap"
              style={{ color: i === idx ? "#a78bfa" : "rgba(255,255,255,0.2)" }}
            >
              {label}
            </span>
          </div>
          {i < 2 && (
            <div
              className="flex-1 h-px mb-4"
              style={{ background: i < idx ? "rgba(139,92,246,0.5)" : "rgba(139,92,246,0.1)" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function SignUpPage() {
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<Access_Level_USER_Role | null>(null);
  const [basicdata, setBasicData] = useState<Basic_Info | null>(null);

  // ── Basic Info form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Basic_Info>();

  // ── Player Details form
  const {
    control,
    register: registerDetails,
    handleSubmit: handleDetailsSubmit,
    formState: { errors: detailsErrors },
  } = useForm<Player>();

 

  // ── Step navigation
  const goNext = () => {
    if (step === "role") setStep("basic");
    else if (step === "basic") setStep("details");
    else if (step === "details") setStep("done");
  };
  const goBack = () => {
    if (step === "details") setStep("basic");
    else if (step === "basic") setStep("role");
  };

  const onBasicSubmit: SubmitHandler<Basic_Info> = (data) => {
    console.log("Basic Info:", data);
    setBasicData(data);
    goNext();
  };

  const onDetailsSubmit: SubmitHandler<Player> = async (data) => {
    console.log("Player Details:", data);
    const finalPost=  {...basicdata, ...data, role : role} as Player;
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(finalPost),
    });
    if(response.ok) goNext();
    else console.error("Signup failed");
    
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gridFade {
          from { opacity: 0; }
          to   { opacity: 0.03; }
        }
        @keyframes stepIn {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .su-fade { animation: fadeUp 0.5s ease forwards; opacity: 0; }
        .anim-grid { animation: gridFade 2s ease forwards; }
        .step-in { animation: stepIn 0.4s ease forwards; }

        .rk-input:focus {
          outline: none;
          border-color: rgba(139,92,246,0.7) !important;
          box-shadow: 0 0 20px rgba(139,92,246,0.15), inset 0 0 10px rgba(139,92,246,0.03);
        }

        .role-card {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .role-card:hover {
          transform: translateY(-4px);
          border-color: rgba(139,92,246,0.6) !important;
          background: rgba(139,92,246,0.07) !important;
        }
        .role-card.selected {
          border-color: rgba(139,92,246,0.9) !important;
          background: rgba(139,92,246,0.1) !important;
          box-shadow: 0 0 30px rgba(139,92,246,0.2);
        }
        .role-card.disabled {
          cursor: not-allowed;
          opacity: 0.45;
        }
        .role-card.disabled:hover {
          transform: none;
          border-color: rgba(139,92,246,0.2) !important;
          background: rgba(255,255,255,0.02) !important;
        }

        .rk-btn-primary {
          clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
          background: linear-gradient(135deg, #a78bfa, #8b5cf6);
          transition: all 0.3s ease;
        }
        .rk-btn-primary:hover:not(:disabled) {
          box-shadow: 0 0 30px rgba(139,92,246,0.6);
          transform: translateY(-1px);
        }
        .rk-btn-primary:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .rk-btn-ghost {
          clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
          transition: all 0.3s ease;
        }
        .rk-btn-ghost:hover {
          background: rgba(139,92,246,0.06);
          border-color: rgba(139,92,246,0.4) !important;
        }

        .rk-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 28px; height: 28px;
          border-top: 1.5px solid rgba(139,92,246,0.5);
          border-left: 1.5px solid rgba(139,92,246,0.5);
        }
        .rk-card::after {
          content: '';
          position: absolute;
          bottom: 0; right: 0;
          width: 28px; height: 28px;
          border-bottom: 1.5px solid rgba(139,92,246,0.5);
          border-right: 1.5px solid rgba(139,92,246,0.5);
        }

        .scroll-form { max-height: 60vh; overflow-y: auto; padding-right: 4px; }
        .scroll-form::-webkit-scrollbar { width: 3px; }
        .scroll-form::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 2px; }

        .warn {
          font-family: 'Rajdhani', sans-serif;
          font-size: 0.72rem;
          color: #f87171;
          letter-spacing: 0.05em;
          margin-top: 4px;
          margin-bottom: 8px;
        }
      `}</style>

      <div className="min-h-screen bg-[#050510] flex items-center justify-center px-4 py-10 relative overflow-hidden">

        {/* Background grid */}
        <div
          className="anim-grid absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(139,92,246,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.7) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 0%, #050510 70%)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 70%)" }}
        />

        {/* ════════════════════════════════════════════
            STEP 1 — ROLE SELECTION
        ════════════════════════════════════════════ */}
        {step === "role" && (
          <div className="w-full max-w-[680px] su-fade">

            <div className="text-center mb-10">
              <p className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.4em] uppercase text-[#8b5cf6] mb-2">
                Join the Arena
              </p>
              <h1
                className="font-[Cinzel,serif] font-black text-white tracking-[0.05em]"
                style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)" }}
              >
                Choose Your{" "}
                <span style={{ background: "linear-gradient(135deg, #a78bfa, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Path
                </span>
              </h1>
              <p className="font-[Rajdhani,sans-serif] text-[0.8rem] text-white/30 mt-2">
                Who are you on this battlefield?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

              {/* ── PLAYER */}
              <div
                onClick={() => setRole(Access_Level_USER_Role.PLAYER)}
                className={`role-card relative p-6 border border-[rgba(139,92,246,0.2)] bg-white/[0.02] ${role === "player" ? "selected" : ""}`}
                style={{ clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)" }}
              >
                <div
                  className="w-10 h-10 border border-[rgba(139,92,246,0.3)] flex items-center justify-center mb-4 bg-[rgba(139,92,246,0.05)]"
                  style={{ clipPath: "polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                    <line x1="12" y1="3" x2="12" y2="17" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M9 6L12 3L15 6" stroke="#8b5cf6" strokeWidth="1.5" strokeLinejoin="round" />
                    <line x1="8" y1="17" x2="16" y2="17" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
                    <line x1="10" y1="20" x2="14" y2="20" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.3em] uppercase text-[#8b5cf6] mb-1">For the</p>
                <h3 className="font-[Cinzel,serif] text-lg font-bold text-white mb-2">Player</h3>
                <p className="font-[Rajdhani,sans-serif] text-[0.75rem] text-white/35 leading-relaxed">
                  Compete in tournaments, earn rankings, build your legacy.
                </p>
                {role === "player" && (
                  <div className="absolute top-2 right-3 font-[Rajdhani,sans-serif] text-[0.5rem] tracking-[0.2em] uppercase text-[#8b5cf6]">
                    ✓ Selected
                  </div>
                )}
              </div>

              {/* ── ORGANISER — Under Development */}
              <div
                className="role-card disabled relative p-6 border border-[rgba(139,92,246,0.2)] bg-white/[0.02]"
                style={{ clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)" }}
              >
                <div
                  className="w-10 h-10 border border-[rgba(139,92,246,0.3)] flex items-center justify-center mb-4 bg-[rgba(139,92,246,0.05)]"
                  style={{ clipPath: "polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                    <path d="M3 17L6 8L10 12L12 5L14 12L18 8L21 17H3Z" stroke="#8b5cf6" strokeWidth="1.5" strokeLinejoin="round" />
                    <line x1="3" y1="20" x2="21" y2="20" stroke="#8b5cf6" strokeWidth="1.5" />
                  </svg>
                </div>
                <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.3em] uppercase text-[#8b5cf6] mb-1">For the</p>
                <h3 className="font-[Cinzel,serif] text-lg font-bold text-white mb-2">Organiser</h3>
                <p className="font-[Rajdhani,sans-serif] text-[0.75rem] text-white/35 leading-relaxed">
                  Host tournaments, set rules, crown champions.
                </p>
                <div
                  className="absolute top-2 right-3 font-[Rajdhani,sans-serif] text-[0.5rem] tracking-[0.2em] uppercase"
                  style={{ color: "#f59e0b" }}
                >
                  ⚒ Coming Soon
                </div>
              </div>

              {/* ── CLUB — Under Development */}
              <div
                className="role-card disabled relative p-6 border border-[rgba(139,92,246,0.2)] bg-white/[0.02]"
                style={{ clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)" }}
              >
                <div
                  className="w-10 h-10 border border-[rgba(139,92,246,0.3)] flex items-center justify-center mb-4 bg-[rgba(139,92,246,0.05)]"
                  style={{ clipPath: "polygon(5px 0%, 100% 0%, calc(100% - 5px) 100%, 0% 100%)" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                    <path d="M12 2L20 6V12C20 16.5 16.5 20 12 22C7.5 20 4 16.5 4 12V6L12 2Z" stroke="#8b5cf6" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M8 12L10.5 14.5L16 9" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="font-[Rajdhani,sans-serif] text-[0.6rem] tracking-[0.3em] uppercase text-[#8b5cf6] mb-1">For the</p>
                <h3 className="font-[Cinzel,serif] text-lg font-bold text-white mb-2">Club Leader</h3>
                <p className="font-[Rajdhani,sans-serif] text-[0.75rem] text-white/35 leading-relaxed">
                  Form a guild, recruit warriors, dominate together.
                </p>
                <div
                  className="absolute top-2 right-3 font-[Rajdhani,sans-serif] text-[0.5rem] tracking-[0.2em] uppercase"
                  style={{ color: "#f59e0b" }}
                >
                  ⚒ Coming Soon
                </div>
              </div>
            </div>

            {/* Guest option */}
            <Link
              href="/"
              className="w-full py-3 border border-[rgba(139,92,246,0.15)] bg-white/[0.01] flex items-center justify-center gap-3 hover:bg-[rgba(139,92,246,0.05)] hover:border-[rgba(139,92,246,0.3)] transition-all duration-300 no-underline"
              style={{ clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)" }}
            >
              <svg viewBox="0 0 20 14" fill="none" className="w-4 h-4 opacity-40">
                <path d="M1 7C1 7 4 1 10 1C16 1 19 7 19 7C19 7 16 13 10 13C4 13 1 7 1 7Z" stroke="white" strokeWidth="1.5" />
                <circle cx="10" cy="7" r="2.5" stroke="white" strokeWidth="1.5" />
              </svg>
              <span className="font-[Rajdhani,sans-serif] text-[0.8rem] tracking-[0.2em] uppercase text-white/30">
                Just Exploring — Enter as Guest
              </span>
            </Link>

            <div className="mt-6 flex justify-between items-center">
              <Link
                href="/login"
                className="font-[Rajdhani,sans-serif] text-[0.75rem] text-white/30 hover:text-[#a78bfa] transition-colors no-underline tracking-wide"
              >
                ← Already have an account?
              </Link>
              <button
                onClick={goNext}
                disabled={role !== "player"}
                className="rk-btn-primary px-8 py-3 font-[Rajdhani,sans-serif] font-bold text-[0.85rem] tracking-[0.2em] uppercase text-white"
              >
                Continue ⟶
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════
            STEP 2 — BASIC INFO
        ════════════════════════════════════════════ */}
        {step === "basic" && (
          <div className="rk-card relative w-full max-w-[500px] bg-[rgba(255,255,255,0.02)] border border-[rgba(139,92,246,0.2)] p-8 step-in">

            <StepBar step={step} />

            <div className="mb-6">
              <p className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.4em] uppercase text-[#8b5cf6] mb-1">
                Step 1 of 2 · Warrior
              </p>
              <h2 className="font-[Cinzel,serif] text-xl font-bold text-white">Basic Information</h2>
            </div>

            <form onSubmit={handleSubmit(onBasicSubmit)}>
              <div className="scroll-form">
                {/* NAME */}
                <label className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.3em] uppercase text-[#8b5cf6] block mb-2">
                  FULL NAME
                </label>
                <input
                  {...register("name", { required: "PLEASE ENTER YOUR NAME" })}
                  type="text"
                  placeholder="enter full name"
                  className="mb-1 rk-input w-full bg-[rgba(139,92,246,0.04)] border border-[rgba(139,92,246,0.2)] text-white/80 font-[Rajdhani,sans-serif] text-[0.9rem] px-4 py-3 placeholder:text-white/20 transition-all duration-300"
                  style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
                />
                {errors.name && <p className="warn">{errors.name.message}</p>}

                <label className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.3em] uppercase text-[#8b5cf6] block mb-2">
                  Username
                </label>
                <input
                  {...register("username", { required: "PLEASE ENTER USERNAME" })}
                  type="text"
                  placeholder="enter username"
                  className="mb-1 rk-input w-full bg-[rgba(139,92,246,0.04)] border border-[rgba(139,92,246,0.2)] text-white/80 font-[Rajdhani,sans-serif] text-[0.9rem] px-4 py-3 placeholder:text-white/20 transition-all duration-300"
                  style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
                />
                {errors.username && <p className="warn">{errors.username.message}</p>}

                {/* EMAIL */}
                <label className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.3em] uppercase text-[#8b5cf6] block mb-2">
                  VALID EMAIL ADDRESS
                </label>
                <input
                  {...register("email", {
                    required: "PLEASE ENTER YOUR EMAIL ADDRESS",
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: "PLEASE ENTER A VALID EMAIL ADDRESS",
                    },
                  })}
                  type="text"
                  placeholder="enter email address"
                  className="mb-1 rk-input w-full bg-[rgba(139,92,246,0.04)] border border-[rgba(139,92,246,0.2)] text-white/80 font-[Rajdhani,sans-serif] text-[0.9rem] px-4 py-3 placeholder:text-white/20 transition-all duration-300"
                  style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
                />
                {errors.email && <p className="warn">{errors.email.message}</p>}

                {/* PASSWORD */}
                <label className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.3em] uppercase text-[#8b5cf6] block mb-2">
                  SET PASSWORD
                </label>
                <input
                  {...register("password", {
                    required: "PLEASE SET YOUR PASSWORD",
                    minLength: { value: 8, message: "PASSWORD MUST BE AT LEAST 8 CHARACTERS" },
                  })}
                  type="password"
                  placeholder="enter password"
                  className="mb-1 rk-input w-full bg-[rgba(139,92,246,0.04)] border border-[rgba(139,92,246,0.2)] text-white/80 font-[Rajdhani,sans-serif] text-[0.9rem] px-4 py-3 placeholder:text-white/20 transition-all duration-300"
                  style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
                />
                {errors.password && <p className="warn">{errors.password.message}</p>}

                {/* DATE OF BIRTH */}
                <label className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.3em] uppercase text-[#8b5cf6] block mb-2">
                  DATE OF BIRTH{" "}
                  <span className="text-white/30 normal-case tracking-normal">(must be 16+)</span>
                </label>
                <input
                  {...register("date_of_birth", {
                    required: "PLEASE ENTER YOUR DATE OF BIRTH",
                    validate: (value) => {
                      const dob = new Date(value as unknown as string);
                      const cutoff = new Date();
                      cutoff.setFullYear(cutoff.getFullYear() - 16);
                      return dob <= cutoff || "YOU MUST BE AT LEAST 16 YEARS OLD";
                    },
                  })}
                  type="date"
                  className="mb-1 rk-input w-full bg-[rgba(139,92,246,0.04)] border border-[rgba(139,92,246,0.2)] text-white/70 font-[Rajdhani,sans-serif] text-[0.9rem] px-4 py-3 transition-all duration-300"
                  style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)", colorScheme: "dark" }}
                />
                {errors.date_of_birth && <p className="warn">{errors.date_of_birth.message}</p>}

                {/* COUNTRY / STATE / CITY */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.3em] uppercase text-[#8b5cf6] block mb-2">
                      COUNTRY
                    </label>
                    <input
                      {...register("country", { required: "REQUIRED" })}
                      type="text"
                      placeholder="country"
                      className="rk-input w-full bg-[rgba(139,92,246,0.04)] border border-[rgba(139,92,246,0.2)] text-white/80 font-[Rajdhani,sans-serif] text-[0.9rem] px-4 py-3 placeholder:text-white/20 transition-all duration-300"
                      style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
                    />
                    {errors.country && <p className="warn">{errors.country.message}</p>}
                  </div>
                  <div className="flex-1">
                    <label className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.3em] uppercase text-[#8b5cf6] block mb-2">
                      STATE
                    </label>
                    <input
                      {...register("state", { required: "REQUIRED" })}
                      type="text"
                      placeholder="state"
                      className="rk-input w-full bg-[rgba(139,92,246,0.04)] border border-[rgba(139,92,246,0.2)] text-white/80 font-[Rajdhani,sans-serif] text-[0.9rem] px-4 py-3 placeholder:text-white/20 transition-all duration-300"
                      style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
                    />
                    {errors.state && <p className="warn">{errors.state.message}</p>}
                  </div>
                  <div className="flex-1">
                    <label className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.3em] uppercase text-[#8b5cf6] block mb-2">
                      CITY
                    </label>
                    <input
                      {...register("city", { required: "REQUIRED" })}
                      type="text"
                      placeholder="city"
                      className="rk-input w-full bg-[rgba(139,92,246,0.04)] border border-[rgba(139,92,246,0.2)] text-white/80 font-[Rajdhani,sans-serif] text-[0.9rem] px-4 py-3 placeholder:text-white/20 transition-all duration-300"
                      style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
                    />
                    {errors.city && <p className="warn">{errors.city.message}</p>}
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={goBack}
                  className="rk-btn-ghost px-6 py-3 font-[Rajdhani,sans-serif] font-semibold text-[0.85rem] tracking-[0.2em] uppercase text-white/40 border border-[rgba(139,92,246,0.2)]"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="rk-btn-primary px-8 py-3 font-[Rajdhani,sans-serif] font-bold text-[0.85rem] tracking-[0.2em] uppercase text-white"
                >
                  Continue ⟶
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ════════════════════════════════════════════
            STEP 3 — PLAYER DETAILS
        ════════════════════════════════════════════ */}
        {step === "details" && (
          <div className="rk-card relative w-full max-w-[560px] bg-[rgba(255,255,255,0.02)] border border-[rgba(139,92,246,0.2)] p-8 step-in">

            <StepBar step={step} />

            <div className="mb-5">
              <p className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.4em] uppercase text-[#8b5cf6] mb-1">
                Step 2 of 2 · Warrior
              </p>
              <h2 className="font-[Cinzel,serif] text-xl font-bold text-white">Battle Profile</h2>
            </div>

            <form onSubmit={handleDetailsSubmit(onDetailsSubmit)}>
              <div className="scroll-form">

                {/* PLAYER TAG */}
                <label className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.3em] uppercase text-[#8b5cf6] block mb-2">
                  PLAYER TAG / IGN
                </label>
                <input
                  {...registerDetails("player_tag", {
                    required: "PLEASE ENTER YOUR PLAYER TAG / IGN",
                  })}
                  type="text"
                  placeholder="e.g. ShadowStrike#1337"
                  className="mb-1 rk-input w-full bg-[rgba(139,92,246,0.04)] border border-[rgba(139,92,246,0.2)] text-white/80 font-[Rajdhani,sans-serif] text-[0.9rem] px-4 py-3 placeholder:text-white/20 transition-all duration-300"
                  style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
                />
                {detailsErrors.player_tag && <p className="warn">{detailsErrors.player_tag.message}</p>}

                {/* TOURNEY GAMES — Controller with chip toggle */}
                <label className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.3em] uppercase text-[#8b5cf6] block mb-2">
                  GAMES I&apos;LL COMPETE IN
                </label>
                <Controller
                  name="tourney_games"
                  control={control}
                  rules={{ validate: (v) => (v && v.length > 0) || "SELECT AT LEAST ONE GAME TO COMPETE IN" }}
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2 mb-1">
                      {Object.values(Games).map((game) => (
                        <button
                          key={game}
                          type="button"
                          onClick={() => {
                            const current = field.value ?? [];
                            const updated = current.includes(game)
                              ? current.filter((g) => g !== game)
                              : [...current, game];
                            field.onChange(updated);
                          }}
                          className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.1em] uppercase px-3 py-1.5 border transition-all duration-200"
                          style={{
                            clipPath: "polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)",
                            borderColor: field.value?.includes(game) ? "rgba(139,92,246,0.8)" : "rgba(139,92,246,0.2)",
                            background: field.value?.includes(game) ? "rgba(139,92,246,0.15)" : "rgba(139,92,246,0.03)",
                            color: field.value?.includes(game) ? "#a78bfa" : "rgba(255,255,255,0.35)",
                          }}
                        >
                          {game}
                        </button>
                      ))}
                    </div>
                  )}
                />
                {detailsErrors.tourney_games && <p className="warn">{detailsErrors.tourney_games.message}</p>}

                {/* PRIMARY DEVICE — Controller */}
                <label className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.3em] uppercase text-[#8b5cf6] block mb-2">
                  PRIMARY DEVICE
                </label>
                <Controller
                  name="device"
                  control={control}
                  rules={{ required: "PLEASE SELECT YOUR PRIMARY DEVICE" }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="mb-1 rk-input w-full bg-[#0a0a1a] border border-[rgba(139,92,246,0.2)] text-white/70 font-[Rajdhani,sans-serif] text-[0.9rem] px-4 py-3 transition-all duration-300 appearance-none cursor-pointer"
                      style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
                    >
                      <option value="" disabled className="text-white/30">Select...</option>
                      {["Mobile", "PC", "Console", "Mobile + PC"].map((d) => (
                        <option key={d} value={d} className="bg-[#0a0a1a]">{d}</option>
                      ))}
                    </select>
                  )}
                />
                {detailsErrors.device && <p className="warn">{detailsErrors.device.message}</p>}

                {/* SKILL LEVEL — Controller */}
                <label className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.3em] uppercase text-[#8b5cf6] block mb-2">
                  SKILL LEVEL
                </label>
                <Controller
                  name="skill_level"
                  control={control}
                  rules={{ required: "PLEASE SELECT YOUR SKILL LEVEL" }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="mb-1 rk-input w-full bg-[#0a0a1a] border border-[rgba(139,92,246,0.2)] text-white/70 font-[Rajdhani,sans-serif] text-[0.9rem] px-4 py-3 transition-all duration-300 appearance-none cursor-pointer"
                      style={{ clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)" }}
                    >
                      <option value="" disabled className="text-white/30">Select...</option>
                      {["Beginner", "Amateur", "Intermediate", "Semi-Pro", "Pro"].map((s) => (
                        <option key={s} value={s} className="bg-[#0a0a1a]">{s}</option>
                      ))}
                    </select>
                  )}
                />
                {detailsErrors.skill_level && <p className="warn">{detailsErrors.skill_level.message}</p>}

              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={goBack}
                  className="rk-btn-ghost px-6 py-3 font-[Rajdhani,sans-serif] font-semibold text-[0.85rem] tracking-[0.2em] uppercase text-white/40 border border-[rgba(139,92,246,0.2)]"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="rk-btn-primary px-8 py-3 font-[Rajdhani,sans-serif] font-bold text-[0.85rem] tracking-[0.2em] uppercase text-white"
                >
                  Forge Legend ⟶
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ════════════════════════════════════════════
            STEP 4 — SUCCESS / DONE
        ════════════════════════════════════════════ */}
        {step === "done" && (
          <div
            className="rk-card relative w-full max-w-[460px] bg-[rgba(255,255,255,0.02)] border border-[rgba(139,92,246,0.3)] p-10 text-center step-in"
            style={{ boxShadow: "0 0 60px rgba(139,92,246,0.15)" }}
          >
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <svg viewBox="0 0 80 80" fill="none" className="w-full h-full" style={{ animation: "spin 8s linear infinite", transformOrigin: "50% 50%" }}>
                <circle cx="40" cy="40" r="36" stroke="#8b5cf6" strokeWidth="0.5" strokeDasharray="4 6" opacity="0.5" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-14 h-14 border-2 border-[#8b5cf6] flex items-center justify-center bg-[rgba(139,92,246,0.1)]"
                  style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)", boxShadow: "0 0 30px rgba(139,92,246,0.4)" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                    <path d="M5 13L9 17L19 7" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            <p className="font-[Rajdhani,sans-serif] text-[0.65rem] tracking-[0.4em] uppercase text-[#8b5cf6] mb-2">
              Account Created
            </p>
            <h2 className="font-[Cinzel,serif] text-2xl font-black text-white mb-3">Welcome</h2>
            <p className="font-[Rajdhani,sans-serif] text-[0.85rem] text-white/40 leading-relaxed mb-8">
              Your warrior profile is ready. Find a tournament and start climbing the ranks.
            </p>

            <div className="space-y-3">
              <Link
                href="/player_profile/1"
                className="rk-btn-primary w-full py-3 font-[Rajdhani,sans-serif] font-bold text-[0.9rem] tracking-[0.2em] uppercase text-white flex items-center justify-center no-underline"
              >
                CHECKOUT YOUR PROFILE PAGE ⟶
              </Link>
              <Link
                href="/"
                className="block font-[Rajdhani,sans-serif] text-[0.75rem] text-white/25 hover:text-[#a78bfa] transition-colors no-underline mt-2 tracking-wide"
              >
                Go to Home
              </Link>
            </div>
          </div>
        )}

      </div>
    </>
  );
}