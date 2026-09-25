import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

type Role = "admin" | "player" | "organiser" | "club_leader";

export async function requireRole(allowedRoles: Role[], userId?: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/signin");

  let userRole = session.user.role as Role;

  // If the session token has cached "player" role from Step 1 of signup, check MongoDB directly in case it was just updated by Step 2/3 (saveRoleProfile)
  if (!allowedRoles.includes(userRole) && userRole === "player") {
    try {
      const client = await clientPromise;
      const db = client.db("RKS");
      const uId = session.user.id || (session.user as Record<string, unknown>)._id;
      if (uId) {
        const filterConditions: Record<string, unknown>[] = [{ id: uId }, { _id: uId }];
        if (typeof uId === "string" && ObjectId.isValid(uId)) {
          try { filterConditions.push({ _id: new ObjectId(uId) }); } catch {}
        }
        const freshUser = await db.collection("user").findOne({ $or: filterConditions });
        if (freshUser && freshUser.role) {
          userRole = freshUser.role as Role;
          session.user.role = userRole;
        }
      }
    } catch (err) {
      console.error("[requireRole] fresh user fetch error:", err);
    }
  }

  if (userRole === "admin") return session;

  if (!allowedRoles.includes(userRole)) redirect("/unauthorized");

  // ownership check — verify either id or _id matches userId
  if (userId) {
    const sId = session.user.id;
    const sId2 = (session.user as Record<string, unknown>)._id as string | undefined;
    if (sId !== userId && sId2 !== userId) {
      redirect("/unauthorized");
    }
  }

  return session;
}

export async function requirePlayer(userId?: string) {
  return requireRole(["player"], userId);
}

export async function requireOrganiser(userId?: string) {
  return requireRole(["organiser"], userId);
}

export async function requireClubLeader(userId?: string) {
  return requireRole(["club_leader"], userId);
}

export async function requireAdmin() {
  return requireRole(["admin"]);
}