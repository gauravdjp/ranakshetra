import 'next-auth';
import { Access_Level_USER_Role } from "@/types/index";

declare module "next-auth" {
    interface Session {
        user: {
            username: string;
            email: string;
            player_tag : string;
            role: Access_Level_USER_Role;
        };
    }
    interface User {
        username: string;
        email: string;
        player_tag : string;
        role: Access_Level_USER_Role;   
    }   
}

declare module "next-auth/jwt" {
    interface JWT {
        username: string;
        player_tag : string;
        role: Access_Level_USER_Role;
    }
}