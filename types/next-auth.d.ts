import 'next-auth';
import { Access_Level_USER_Role } from "@/types/index";

declare module "next-auth" {
    interface Session {
        user: {
            _id?: string;              // FIX: added — MongoDB document _id
            id?: string;               // FIX: added — NextAuth default id alias
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
        _id?: string;
        id?: string;
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
        _id?: string;                  // FIX: added — carried in JWT token
        username: string;
        role: Access_Level_USER_Role;
        player_tag?: string;
        arena_name?: string;
        arena_location?: string;
        club_name?: string;
        club_tag?: string;
    }
}