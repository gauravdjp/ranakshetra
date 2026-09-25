"use client";

import { useState } from "react";
import { clubProfileSchema, type ClubProfileData } from "@/lib/signup-schemas";

const GAMES = ["League of Legends","Valorant","Counter-Strike 2","Dota 2","PUBG: Battlegrounds","Apex Legends","Fortnite","Rocket League"];
const COUNTRIES = ["India","United States","United Kingdom","Germany","Brazil","Australia","Canada","France","South Korea","Japan"];

const inputClass = `w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:bg-white/7`;

interface StepThreeClubProps {
  initialData: Partial<ClubProfileData>;
  onBack: () => void;
  pending: boolean;
  errors?: Record<string, string[]>;
  onSubmit: (formData: FormData) => void;
}

export default function StepThreeClub({ initialData, onBack, pending, errors: serverErrors, onSubmit }: StepThreeClubProps) {
  const [fields, setFields] = useState({
    clubName: initialData.clubName ?? "",
    country: initialData.country ?? "United States",
    stateProvince: initialData.stateProvince ?? "",
    city: initialData.city ?? "",
    primaryGames: initialData.primaryGames ?? [] as string[],
  });
  const [clientErrors, setClientErrors] = useState<Partial<Record<keyof ClubProfileData, string>>>({});

  const getError = (f: string) => clientErrors[f as keyof ClubProfileData] || serverErrors?.[f]?.[0];

  const toggle = (game: string) =>
    setFields((p) => ({ ...p, primaryGames: p.primaryGames.includes(game) ? p.primaryGames.filter((g) => g !== game) : [...p.primaryGames, game] }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFields((p) => ({ ...p, [name]: value }));
    if (clientErrors[name as keyof ClubProfileData]) setClientErrors((p) => ({ ...p, [name]: undefined }));
  };

  const validate = () => {
    const r = clubProfileSchema.safeParse(fields);
    if (!r.success) {
      setClientErrors(Object.fromEntries(Object.entries(r.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0]])) as Partial<Record<keyof ClubProfileData, string>>);
      return false;
    }
    return true;
  };
  const handleSubmit = () => {
    if (!validate()) return;
    const formData = new FormData();
    formData.append("clubName", fields.clubName);
    formData.append("country", fields.country);
    formData.append("stateProvince", fields.stateProvince);
    formData.append("city", fields.city);
    fields.primaryGames.forEach((g) => formData.append("primaryGames", g));
    onSubmit(formData);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto px-4 py-10 animate-[fadeUp_0.4s_ease_both]">
      <div className="w-full mb-4">
        <span className="font-dm-mono text-[0.68rem] tracking-[0.15em] text-violet-400 uppercase">Step 03 / 03</span>
      </div>

      <div className="w-full bg-white/3 border border-white/8 rounded-2xl p-6 sm:p-8 flex flex-col gap-5 backdrop-blur-sm">
        <div className="mb-1">
          <h1 className="font-outfit text-3xl font-bold text-white tracking-wide mb-1">Club Profile</h1>
          <p className="text-xs text-white/35 leading-relaxed">Finalize your professional presence. Visible to potential members and partners.</p>
        </div>

        {/* Club name */}
        <div className="flex flex-col gap-2">
          <label htmlFor="clubName" className="font-dm-mono text-[0.68rem] tracking-[0.12em] text-white/30 uppercase">Club Name</label>
          <input id="clubName" name="clubName" placeholder="Enter club name" value={fields.clubName} onChange={handleChange}
            className={`${inputClass} ${getError("clubName") ? "border-red-500/60" : ""}`}
          />
          {getError("clubName") && <span className="text-xs text-red-400">{getError("clubName")}</span>}
        </div>

        {/* Country / State / City */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex flex-col gap-2">
            <label htmlFor="country" className="font-dm-mono text-[0.68rem] tracking-[0.12em] text-white/30 uppercase">Country</label>
            <div className="relative">
              <select id="country" name="country" value={fields.country} onChange={handleChange}
                className={`${inputClass} appearance-none pr-8 [color-scheme:dark]`}
              >
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none text-xs">▾</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="stateProvince" className="font-dm-mono text-[0.68rem] tracking-[0.12em] text-white/30 uppercase">State</label>
            <input id="stateProvince" name="stateProvince" placeholder="State/Prov" value={fields.stateProvince} onChange={handleChange} className={inputClass} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="city" className="font-dm-mono text-[0.68rem] tracking-[0.12em] text-white/30 uppercase">City</label>
            <input id="city" name="city" placeholder="City" value={fields.city} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        {/* Game tags */}
        <div className="flex flex-col gap-2">
          <label className="font-dm-mono text-[0.68rem] tracking-[0.12em] text-white/30 uppercase">Primary Game Support</label>
          <div className="flex flex-wrap gap-2">
            {GAMES.map((g) => {
              const active = fields.primaryGames.includes(g);
              return (
                <button key={g} type="button" onClick={() => toggle(g)}
                  className={`px-3 py-1.5 rounded-full border font-dm-mono text-[0.65rem] tracking-wide uppercase transition-all ${
                    active ? "border-violet-500 bg-violet-500/15 text-violet-400" : "border-white/10 text-white/35 hover:border-white/25 hover:text-white/60"
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
          {getError("primaryGames") && <span className="text-xs text-red-400">{getError("primaryGames")}</span>}
        </div>

        <div className="flex justify-between items-center pt-1">
          <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Back
          </button>
          <button type="button" onClick={handleSubmit} disabled={pending}
            className="px-6 py-2.5 bg-white text-[#0d0d0f] rounded-lg font-dm-mono text-xs font-bold tracking-widest uppercase transition-all hover:bg-violet-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {pending ? "Registering..." : "Complete Registration"}
          </button>
        </div>
      </div>
    </div>
  );
}