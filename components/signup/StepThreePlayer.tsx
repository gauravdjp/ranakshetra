"use client";

import { useState } from "react";
import { playerProfileSchema, type PlayerProfileData } from "@/lib/signup-schemas";

const GAMES = [
  "Valorant","Counter-Strike 2","League of Legends","Dota 2",
  "PUBG: Battlegrounds","Apex Legends","Fortnite","Rocket League",
  "Call of Duty: Warzone","Rainbow Six Siege",
];

const inputClass = (err: boolean) =>
  `w-full bg-white/5 border rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition-all focus:ring-2 ${
    err ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
        : "border-white/10 focus:border-violet-500 focus:ring-violet-500/20 focus:bg-white/7"
  }`;

interface StepThreePlayerProps {
  initialData: Partial<PlayerProfileData>;
  onBack: () => void;
  pending: boolean;
  errors?: Record<string, string[]>;
  onSubmit: (formData: FormData) => void;
}

export default function StepThreePlayer({ initialData, onBack, pending, errors: serverErrors, onSubmit }: StepThreePlayerProps) {
  const [fields, setFields] = useState({ primaryGame: initialData.primaryGame ?? "", gameId: initialData.gameId ?? "" });
  const [clientErrors, setClientErrors] = useState<Partial<Record<keyof PlayerProfileData, string>>>({});

  const getError = (f: string) => clientErrors[f as keyof PlayerProfileData] || serverErrors?.[f]?.[0];

  const validate = () => {
    const r = playerProfileSchema.safeParse(fields);
    if (!r.success) {
      const flat = r.error.flatten().fieldErrors;
      setClientErrors(Object.fromEntries(Object.entries(flat).map(([k, v]) => [k, v?.[0]])) as Partial<Record<keyof PlayerProfileData, string>>);
      return false;
    }
    return true;
  };
  const handleSubmit = () => {
    if (!validate()) return;
    const formData = new FormData();
    formData.append("primaryGame", fields.primaryGame);
    formData.append("gameId", fields.gameId);
    onSubmit(formData);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto px-4 py-12 animate-[fadeUp_0.4s_ease_both]">
      <div className="text-center mb-8 w-full">
        <h1 className="font-outfit text-4xl font-bold text-white tracking-wide mb-2">Gaming Profile</h1>
        <p className="text-sm text-white/40 leading-relaxed">Finalize your player identity for Ranakshetra competitions.</p>
      </div>

      <div className="w-full bg-white/3 border border-white/8 rounded-2xl p-6 sm:p-8 flex flex-col gap-5 backdrop-blur-sm">

        {/* Primary game */}
        <div className="flex flex-col gap-2">
          <label htmlFor="primaryGame" className="font-dm-mono text-[0.68rem] tracking-[0.12em] text-white/30 uppercase">
            Primary Game <span className="text-violet-400">*</span>
          </label>
          <div className="relative">
            <select
              id="primaryGame" name="primaryGame"
              value={fields.primaryGame}
              onChange={(e) => { setFields((p) => ({ ...p, primaryGame: e.target.value })); if (clientErrors.primaryGame) setClientErrors((p) => ({ ...p, primaryGame: undefined })); }}
              className={`${inputClass(!!getError("primaryGame"))} appearance-none pr-10 [color-scheme:dark]`}
            >
              <option value="">Select a title...</option>
              {GAMES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none text-xs">▾</span>
          </div>
          {getError("primaryGame") && <span className="text-xs text-red-400">{getError("primaryGame")}</span>}
        </div>

        {/* Game ID */}
        <div className="flex flex-col gap-2">
          <label htmlFor="gameId" className="font-dm-mono text-[0.68rem] tracking-[0.12em] text-white/30 uppercase">Game ID / In-Game Name</label>
          <input
            id="gameId" name="gameId" placeholder="e.g. Player#1234"
            value={fields.gameId}
            onChange={(e) => { setFields((p) => ({ ...p, gameId: e.target.value })); if (clientErrors.gameId) setClientErrors((p) => ({ ...p, gameId: undefined })); }}
            className={inputClass(!!getError("gameId"))}
          />
          {getError("gameId") && <span className="text-xs text-red-400">{getError("gameId")}</span>}
        </div>

        <button
          type="button" disabled={pending}
          onClick={handleSubmit}
          className="w-full py-3.5 bg-white text-[#0d0d0f] rounded-lg font-dm-mono text-xs font-bold tracking-widest uppercase transition-all hover:bg-violet-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {pending ? "Registering..." : "Complete Profile"}
        </button>

        <button
          type="button" onClick={onBack}
          className="w-full py-3 border border-white/10 rounded-lg font-dm-mono text-xs tracking-widest text-white/40 hover:border-white/25 hover:text-white/70 transition-all uppercase"
        >
          Back
        </button>

        <p className="flex items-start gap-2 text-xs text-white/25 leading-relaxed">
          <svg className="shrink-0 mt-0.5" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Ensure your Game ID matches exactly as seen in-game. Incorrect IDs may lead to tournament disqualification.
        </p>
      </div>
    </div>
  );
}