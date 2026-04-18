import 'next-auth';
import { Access_Level_USER_Role } from "@/types/index";

declare module "next-auth" {
    interface Session {
        user: {
            username: string;
            email: string;
            role: Access_Level_USER_Role;
            // Player-specific
            player_tag?: string;
            // Organiser-specific
            arena_name?: string;
            arena_location?: string;
            // Club-specific
            club_name?: string;
            club_tag?: string;
        };
    }
    interface User {
        username: string;
        email: string;
        role: Access_Level_USER_Role;
        player_tag?: string;
        arena_name?: string;
        arena_location?: string;
        club_name?: string;
        club_tag?: string;
    }   
}

declare module "next-auth/jwt" {
    interface JWT {
        username: string;
        role: Access_Level_USER_Role;
        player_tag?: string;
        arena_name?: string;
        arena_location?: string;
        club_name?: string;
        club_tag?: string;
    }
}