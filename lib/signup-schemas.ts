import { z } from "zod";

export const basicInfoSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be under 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, underscores allowed"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
});

export const playerProfileSchema = z.object({
  primaryGame: z.string().min(1, "Please select a game"),
  gameId: z
    .string()
    .min(2, "Game ID must be at least 2 characters")
    .max(50, "Game ID too long"),
});

export const organiserProfileSchema = z.object({
  arenaName: z.string().min(2, "Arena name must be at least 2 characters"),
  country: z.string().min(1, "Please select a country"),
  stateProvince: z.string().min(1, "State/Province is required"),
  city: z.string().min(1, "City is required"),
  primaryGameSupport: z
    .array(z.string())
    .min(1, "Select at least one game type"),
});

export const clubProfileSchema = z.object({
  clubName: z.string().min(2, "Club name must be at least 2 characters"),
  country: z.string().min(1, "Please select a country"),
  stateProvince: z.string().optional(),
  city: z.string().optional(),
  primaryGames: z.array(z.string()).min(1, "Select at least one game"),
});

export type BasicInfoData = z.infer<typeof basicInfoSchema>;
export type PlayerProfileData = z.infer<typeof playerProfileSchema>;
export type OrganiserProfileData = z.infer<typeof organiserProfileSchema>;
export type ClubProfileData = z.infer<typeof clubProfileSchema>;
export type Role = "player" | "organiser" | "club_leader";