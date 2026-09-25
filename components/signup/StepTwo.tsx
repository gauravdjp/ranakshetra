"use client";

import { useState } from "react";
import { basicInfoSchema, type BasicInfoData } from "@/lib/signup-schemas";

interface StepTwoProps {
  initialData: Partial<BasicInfoData>;
  onNext: (data: BasicInfoData) => void;
  onBack: () => void;
}

const inputClass = (hasError: boolean) =>
  `w-full bg-white/5 border rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition-all focus:ring-2 ${
    hasError
      ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
      : "border-white/10 focus:border-violet-500 focus:ring-violet-500/20 focus:bg-white/7"
  }`;

export default function StepTwo({ initialData, onNext, onBack }: StepTwoProps) {
  const [fields, setFields] = useState({
    username: initialData.username ?? "",
    email: initialData.email ?? "",
    password: initialData.password ?? "",
    dateOfBirth: initialData.dateOfBirth ?? "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BasicInfoData, string>>>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof BasicInfoData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleNext = () => {
    const result = basicInfoSchema.safeParse(fields);
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors;
      setErrors(Object.fromEntries(Object.entries(flat).map(([k, v]) => [k, v?.[0]])) as Partial<Record<keyof BasicInfoData, string>>);
      return;
    }
    onNext(result.data);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto px-4 py-12 animate-[fadeUp_0.4s_ease_both]">

      {/* Header */}
      <div className="text-center mb-8 w-full">
        <span className="block font-dm-mono text-[0.7rem] tracking-[0.15em] text-violet-400 mb-3 uppercase">Step 02 / 03</span>
        <h1 className="font-dm-mono text-3xl sm:text-4xl font-bold text-white tracking-[0.06em] mb-2">ACCOUNT SETUP</h1>
        <p className="text-sm text-white/40 leading-relaxed">Define your operational parameters for the Ranakshetra network.</p>
      </div>

      {/* Card */}
      <div className="w-full bg-white/3 border border-white/8 rounded-2xl p-6 sm:p-8 flex flex-col gap-5 backdrop-blur-sm">

        {/* Username */}
        <div className="flex flex-col gap-2">
          <label htmlFor="username" className="font-dm-mono text-[0.68rem] tracking-[0.12em] text-white/30 uppercase">Username</label>
          <input
            id="username" name="username" placeholder="OPERATOR_NAME"
            value={fields.username} onChange={handleChange} autoComplete="username"
            className={inputClass(!!errors.username)}
          />
          {errors.username && <span className="text-xs text-red-400">{errors.username}</span>}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="font-dm-mono text-[0.68rem] tracking-[0.12em] text-white/30 uppercase">Email Address</label>
          <input
            id="email" name="email" type="email" placeholder="contact@legacy.com"
            value={fields.email} onChange={handleChange} autoComplete="email"
            className={inputClass(!!errors.email)}
          />
          {errors.email && <span className="text-xs text-red-400">{errors.email}</span>}
        </div>

        {/* Password + DOB row */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col gap-2 flex-1">
            <label htmlFor="password" className="font-dm-mono text-[0.68rem] tracking-[0.12em] text-white/30 uppercase">Password</label>
            <div className="relative flex items-center">
              <input
                id="password" name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={fields.password} onChange={handleChange} autoComplete="new-password"
                className={`${inputClass(!!errors.password)} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
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
            {errors.password && <span className="text-xs text-red-400">{errors.password}</span>}
          </div>

          <div className="flex flex-col gap-2 sm:w-44">
            <label htmlFor="dateOfBirth" className="font-dm-mono text-[0.68rem] tracking-[0.12em] text-white/30 uppercase">Date of Birth</label>
            <input
              id="dateOfBirth" name="dateOfBirth" type="date"
              value={fields.dateOfBirth} onChange={handleChange}
              className={`${inputClass(!!errors.dateOfBirth)} [color-scheme:dark]`}
            />
            {errors.dateOfBirth && <span className="text-xs text-red-400">{errors.dateOfBirth}</span>}
          </div>
        </div>

        {/* Nav */}
        <div className="flex justify-between items-center pt-2">
          <button
            type="button" onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Back
          </button>
          <button
            type="button" onClick={handleNext}
            className="px-6 py-2.5 bg-white text-[#0d0d0f] rounded-lg font-dm-mono text-xs font-bold tracking-widest uppercase transition-all hover:bg-violet-400 hover:text-white"
          >
            Next Protocol
          </button>
        </div>
      </div>
    </div>
  );
}