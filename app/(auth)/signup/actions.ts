"use server";

import {
  playerProfileSchema,
  organiserProfileSchema,
  clubProfileSchema,
  type Role,
} from "@/lib/signup-schemas";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export type SignupActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

export async function saveRoleProfile(
  userId: string,
  username: string,
  role: Role,
  formData: FormData
): Promise<SignupActionState> {
  try {
    let roleProfileData: Record<string, unknown> = {};

    if (role === "player") {
      const parsed = playerProfileSchema.safeParse({
        primaryGame: formData.get("primaryGame"),
        gameId: formData.get("gameId"),
      });
      if (!parsed.success) {
        return {
          fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
          error: "Please fix the errors below",
        };
      }
      roleProfileData = parsed.data;
    } else if (role === "organiser") {
      const parsed = organiserProfileSchema.safeParse({
        arenaName: formData.get("arenaName"),
        country: formData.get("country"),
        stateProvince: formData.get("stateProvince"),
        city: formData.get("city"),
        primaryGameSupport: formData.getAll("primaryGameSupport"),
      });
      if (!parsed.success) {
        return {
          fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
          error: "Please fix the errors below",
        };
      }
      roleProfileData = parsed.data;
    } else if (role === "club_leader") {
      const parsed = clubProfileSchema.safeParse({
        clubName: formData.get("clubName"),
        country: formData.get("country"),
        stateProvince: formData.get("stateProvince"),
        city: formData.get("city"),
        primaryGames: formData.getAll("primaryGames"),
      });
      if (!parsed.success) {
        return {
          fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
          error: "Please fix the errors below",
        };
      }
      roleProfileData = parsed.data;
    } else {
      return { error: "Invalid role selected" };
    }

    const client = await clientPromise;
    const db = client.db("RKS");

    // set role + username on better auth user
    const filterConditions: Record<string, unknown>[] = [
      { id: userId },
      { _id: userId }
    ];
    if (typeof userId === "string" && ObjectId.isValid(userId)) {
      try {
        filterConditions.push({ _id: new ObjectId(userId) });
      } catch {}
    }

    await db.collection("user").updateOne(
      { $or: filterConditions },
      { $set: { role, username } }
    );

    // write to role specific collection
    const collectionMap: Record<Role, string> = {
      player: "user_player",
      organiser: "user_organiser",
      club_leader: "user_club",
    };

    await db.collection(collectionMap[role]).insertOne({
      userId,
      username,
      role,
      ...roleProfileData,
      createdAt: new Date(),
    });

    if (role === "organiser") {
      const orgData = roleProfileData as Record<string, unknown>;
      const existingArena = await db.collection("arenas").findOne({ organizer_id: userId });
      if (!existingArena) {
        await db.collection("arenas").insertOne({
          arena_name: (orgData.arenaName as string) || `${username}'s Arena`,
          arena_location: [orgData.city, orgData.stateProvince, orgData.country].filter(Boolean).join(", "),
          arena_city: (orgData.city as string) || "",
          arena_state: (orgData.stateProvince as string) || "",
          organizer_id: userId,
          organizer_name: username,
          supported_games: Array.isArray(orgData.primaryGameSupport) ? orgData.primaryGameSupport : ["CLASH ROYALE"],
          members: [{ user_id: userId, name: username, role: "owner" }],
          is_verified: true,
          created_at: new Date(),
        });
      }
    }

    return { success: true };
  } catch (err) {
    console.error("Save role error:", err);
    return { error: "Something went wrong. Please try again." };
  }
}