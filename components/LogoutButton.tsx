"use client";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="px-6 py-2.5 bg-transparent border border-white/20 text-white/60 hover:border-red-500/50 hover:text-red-400 transition-all font-dm-mono text-xs tracking-widest uppercase rounded-lg"
    >
      Sign Out
    </button>
  );
}