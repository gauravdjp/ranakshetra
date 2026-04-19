import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "@/lib/mongodb";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                identifier: { label: "Email", type: "email", placeholder: "Enter your email" },
                password: { label: "Password", type: "password", placeholder: "Enter your password" }
            },
            async authorize(credentials: any): Promise<any> {
                const client = await clientPromise;
                const db = client.db("RKS");

                const user = await db.collection("signup").findOne({
                    $or: [
                        { email: credentials.identifier },
                        { username: credentials.identifier }
                    ]
                });

                if (!user) {
                    throw new Error("No user found with the provided email or username");
                }

                if (user.password !== credentials.password) {
                    throw new Error("Invalid password");
                }

                // Build the base return object shared by all roles
                const baseUser = {
                    id:       user._id.toString(),
                    _id:      user._id.toString(),   // FIX: expose MongoDB _id explicitly
                    username: user.username,
                    email:    user.email,
                    role:     user.role,
                };

                // Attach role-specific fields only when they exist
                return {
                    ...baseUser,
                    // Player
                    ...(user.player_tag     && { player_tag: user.player_tag }),
                    // Organiser
                    ...(user.arena_name     && { arena_name: user.arena_name }),
                    ...(user.arena_location && { arena_location: user.arena_location }),
                    // Club
                    ...(user.club_name      && { club_name: user.club_name }),
                    ...(user.club_tag       && { club_tag: user.club_tag }),
                };
            }
        })
    ],

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token._id           = user._id ?? user.id;    // FIX: carry _id in token
                token.username      = user.username;
                token.role          = user.role;
                token.email         = user.email;
                // Player
                if (user.player_tag)     token.player_tag     = user.player_tag;
                // Organiser
                if (user.arena_name)     token.arena_name     = user.arena_name;
                if (user.arena_location) token.arena_location = user.arena_location;
                // Club
                if (user.club_name)      token.club_name      = user.club_name;
                if (user.club_tag)       token.club_tag       = user.club_tag;
            }
            return token;
        },

        async session({ session, token }) {
            if (token) {
                session.user._id          = token._id;             // FIX: expose _id in session
                session.user.id           = token._id;             // FIX: id alias
                session.user.username     = token.username;
                session.user.email        = token.email ?? "";
                session.user.role         = token.role;
                // Player
                if (token.player_tag)     session.user.player_tag     = token.player_tag;
                // Organiser
                if (token.arena_name)     session.user.arena_name     = token.arena_name;
                if (token.arena_location) session.user.arena_location = token.arena_location;
                // Club
                if (token.club_name)      session.user.club_name      = token.club_name;
                if (token.club_tag)       session.user.club_tag       = token.club_tag;
            }
            return session;
        }
    },

    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
};