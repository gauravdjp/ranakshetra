import { requireOrganiser } from "@/lib/session";
import LogoutButton from "@/components/LogoutButton";

export default async function OrganiserDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireOrganiser(id);
  return (
    <div className="min-h-screen flex flex-col gap-6 items-center justify-center bg-[#0d0d0f] text-white">
      <h1 className="text-4xl font-bold">Welcome {session.user.username}</h1>
      <LogoutButton/>
    </div>
  );
}