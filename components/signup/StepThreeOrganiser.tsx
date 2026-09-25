"use client";

import { useState } from "react";
import { organiserProfileSchema, type OrganiserProfileData } from "@/lib/signup-schemas";

const GAME_TYPES = ["FPS", "MOBA", "BATTLE ROYALE", "SPORTS"];
const COUNTRIES = ["India","United States","United Kingdom","Germany","Brazil","Australia","Canada","France","South Korea","Japan"];

const inputClass = (err?: boolean) =>
  `w-full bg-white/5 border rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition-all focus:ring-2 ${
    err ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
        : "border-white/10 focus:border-violet-500 focus:ring-violet-500/20 focus:bg-white/7"
  }`;

interface StepThreeOrganiserProps {
  initialData: Partial<OrganiserProfileData>;
  onBack: () => void;
  pending: boolean;
  errors?: Record<string, string[]>;
  onSubmit: (formData: FormData) => void;
}

export default function StepThreeOrganiser({ initialData, onBack, pending, errors: serverErrors, onSubmit }: StepThreeOrganiserProps) {
  const [fields, setFields] = useState({
    arenaName: initialData.arenaName ?? "",
    country: initialData.country ?? "",
    stateProvince: initialData.stateProvince ?? "",
    city: initialData.city ?? "",
    primaryGameSupport: initialData.primaryGameSupport ?? [] as string[],
  });
  const [clientErrors, setClientErrors] = useState<Partial<Record<keyof OrganiserProfileData, string>>>({});

  const getError = (f: string) => clientErrors[f as keyof OrganiserProfileData] || serverErrors?.[f]?.[0];

  const toggle = (game: string) =>
    setFields((p) => ({ ...p, primaryGameSupport: p.primaryGameSupport.includes(game) ? p.primaryGameSupport.filter((g) => g !== game) : [...p.primaryGameSupport, game] }));

  const validate = () => {
    const r = organiserProfileSchema.safeParse(fields);
    if (!r.success) {
      setClientErrors(Object.fromEntries(Object.entries(r.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0]])) as Partial<Record<keyof OrganiserProfileData, string>>);
      return false;
    }
    return true;
  };
  const handleSubmit = () => {
    if (!validate()) return;
    const formData = new FormData();
    formData.append("arenaName", fields.arenaName);
    formData.append("country", fields.country);
    formData.append("stateProvince", fields.stateProvince);
    formData.append("city", fields.city);
    fields.primaryGameSupport.forEach((g) => formData.append("primaryGameSupport", g));
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFields((p) => ({ ...p, [name]: value }));
    if (clientErrors[name as keyof OrganiserProfileData]) setClientErrors((p) => ({ ...p, [name]: undefined }));
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto px-4 py-10 animate-[fadeUp_0.4s_ease_both]">
      <div className="w-full mb-6">
        <div className="flex justify-between items-center mb-1">
          <span className="font-dm-mono text-[0.68rem] tracking-[0.15em] text-violet-400 uppercase">Step 03 / 03</span>
          <span className="font-dm-mono text-[0.65rem] tracking-widest text-white/25">Final Stage</span>
        </div>
      </div>

      <div className="w-full bg-white/3 border border-white/8 rounded-2xl p-6 sm:p-8 flex flex-col gap-5 backdrop-blur-sm">
        <div className="mb-1">
          <h1 className="font-outfit text-3xl font-bold text-white tracking-wide mb-1">Organiser Details</h1>
          <p className="text-xs text-white/35 leading-relaxed">Provide the physical location and operational details of your esports venue.</p>
        </div>

        {/* Arena name */}
        <div className="flex flex-col gap-2">
          <label htmlFor="arenaName" className="font-dm-mono text-[0.68rem] tracking-[0.12em] text-white/30 uppercase">Arena Name</label>
          <input id="arenaName" name="arenaName" placeholder="e.g. Nexus Gaming Center" value={fields.arenaName} onChange={handleChange} className={inputClass(!!getError("arenaName"))} />
          {getError("arenaName") && <span className="text-xs text-red-400">{getError("arenaName")}</span>}
        </div>

        {/* Country + State */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col gap-2 flex-1">
            <label htmlFor="country" className="font-dm-mono text-[0.68rem] tracking-[0.12em] text-white/30 uppercase">Country</label>
            <div className="relative">
              <select id="country" name="country" value={fields.country} onChange={handleChange} className={`${inputClass(!!getError("country"))} appearance-none pr-10 [color-scheme:dark]`}>
                <option value="">Select Country</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none text-xs">▾</span>
            </div>
            {getError("country") && <span className="text-xs text-red-400">{getError("country")}</span>}
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <label htmlFor="stateProvince" className="font-dm-mono text-[0.68rem] tracking-[0.12em] text-white/30 uppercase">State / Province</label>
            <input id="stateProvince" name="stateProvince" placeholder="e.g. California" value={fields.stateProvince} onChange={handleChange} className={inputClass()} />
          </div>
        </div>

        {/* City */}
        <div className="flex flex-col gap-2">
          <label htmlFor="city" className="font-dm-mono text-[0.68rem] tracking-[0.12em] text-white/30 uppercase">City</label>
          <input id="city" name="city" placeholder="e.g. San Francisco" value={fields.city} onChange={handleChange} className={inputClass(!!getError("city"))} />
          {getError("city") && <span className="text-xs text-red-400">{getError("city")}</span>}
        </div>

        {/* Game support tags */}
        <div className="flex flex-col gap-2">
          <label className="font-dm-mono text-[0.68rem] tracking-[0.12em] text-white/30 uppercase">Primary Game Support</label>
          <div className="flex flex-wrap gap-2">
            {GAME_TYPES.map((g) => {
              const active = fields.primaryGameSupport.includes(g);
              return (
                <button key={g} type="button" onClick={() => toggle(g)}
                  className={`px-4 py-1.5 rounded-full border font-dm-mono text-[0.68rem] tracking-widest uppercase transition-all ${
                    active ? "border-violet-500 bg-violet-500/15 text-violet-400" : "border-white/10 text-white/35 hover:border-white/25 hover:text-white/60"
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
          {getError("primaryGameSupport") && <span className="text-xs text-red-400">{getError("primaryGameSupport")}</span>}
        </div>

        

        <button type="button" onClick={handleSubmit} disabled={pending}
          className="w-full py-3.5 bg-white text-[#0d0d0f] rounded-lg font-dm-mono text-xs font-bold tracking-widest uppercase transition-all hover:bg-violet-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {pending ? "Registering..." : "Complete Registration ✓"}
        </button>
        <button type="button" onClick={onBack}
          className="w-full py-3 border border-white/10 rounded-lg font-dm-mono text-xs tracking-widest text-white/40 hover:border-white/25 hover:text-white/70 transition-all uppercase"
        >
          Back to Role Selection
        </button>
      </div>
    </div>
  );
}