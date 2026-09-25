"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { saveRoleProfile } from "./actions";
import StepOne from "@/components/signup/StepOne";
import StepTwo from "@/components/signup/StepTwo";
import StepThreePlayer from "@/components/signup/StepThreePlayer";
import StepThreeOrganiser from "@/components/signup/StepThreeOrganiser";
import StepThreeClub from "@/components/signup/StepThreeClub";
import type { Role, BasicInfoData } from "@/lib/signup-schemas";

export default function SignupPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState<Role | null>(null);
  const [basicInfo, setBasicInfo] = useState<Partial<BasicInfoData>>({});
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);
  
  async function handleStepThreeSubmit(formData: FormData) {
    if (!role || !basicInfo.email || !basicInfo.password || !basicInfo.username) return;

    setPending(true);
    setError(null);

    try {
      // Step 1: auth signup + auto session
      const { data, error: authError } = await authClient.signUp.email({
        email: basicInfo.email,
        password: basicInfo.password,
        name: basicInfo.username,
        username: basicInfo.username,
      });

      if (authError) {
        setError(authError.message || "Signup failed");
        return;
      }

      const userId = data.user.id;

      // Step 2: save role data to MongoDB
      const result = await saveRoleProfile(userId, basicInfo.username, role, formData);

      if (result.error) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }
      const redirectMap: Record<Role, string> = {
        player:      `/playerhp/${userId}`,
        organiser:   `/arenahp/${userId}`,
        club_leader: `/clubhp/${userId}`,
      };
      // Step 3: redirect
      router.push(redirectMap[role]);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0d0d0f] text-white flex flex-col items-center relative overflow-x-hidden">

      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-violet-600 opacity-10 blur-[120px] -top-48 -left-24 animate-pulse" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-pink-600 opacity-8 blur-[100px] -bottom-24 -right-12" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(rgba(124,111,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,111,255,0.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-2.5 pt-7 pb-0">
        <span className="text-2xl text-violet-400 drop-shadow-[0_0_12px_rgba(124,111,255,0.5)]">⚔</span>
        <span className="font-dm-mono text-xs tracking-[0.28em] text-white/35 uppercase">Ranakshetra</span>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 w-full max-w-xs mt-5 h-[2px] bg-white/8 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all duration-500"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      {/* Global error */}
      {error && (
        <div role="alert" className="relative z-10 mt-4 px-5 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 max-w-sm w-full mx-4 text-center">
          {error}
        </div>
      )}

      <div className="relative z-10 w-full flex justify-center">
        {step === 1 && (
          <StepOne
            selectedRole={role}
            onSelect={setRole}
            onNext={() => { if (role) setStep(2); }}
            onBack={() => window.history.back()}
          />
        )}
        {step === 2 && (
          <StepTwo
            initialData={basicInfo}
            onNext={(data) => { setBasicInfo(data); setStep(3); }}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && role === "player" && (
          <StepThreePlayer
            initialData={{}}
            onBack={() => setStep(2)}
            pending={pending}
            errors={fieldErrors}
            onSubmit={handleStepThreeSubmit}
          />
        )}
        {step === 3 && role === "organiser" && (
          <StepThreeOrganiser
            initialData={{}}
            onBack={() => setStep(2)}
            pending={pending}
            errors={fieldErrors}
            onSubmit={handleStepThreeSubmit}
          />
        )}
        {step === 3 && role === "club_leader" && (
          <StepThreeClub
            initialData={{}}
            onBack={() => setStep(2)}
            pending={pending}
            errors={fieldErrors}
            onSubmit={handleStepThreeSubmit}
          />
        )}
      </div>
    </main>
  );
}