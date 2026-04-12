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
            async authorize(credentials:any): Promise<any> {
                const client = await clientPromise;
                const db = client.db("RKS");
                console.log("credentials received:", credentials);
                const user = await db.collection("signup").findOne({
                    $or : [
                        { email: credentials.identifier},
                        { username: credentials.identifier }
                    ]
                });
                console.log("user found:", user);
                if (!user) {
                    throw new Error("No user found with the provided email or username");
                } 
                
                console.log("db password:", user.password); 
                console.log("input password:", credentials.password);
                if( user.password === credentials.password){
                    return user
                } 
                else {
                    throw new Error("Invalid password");
                }
            }
        })
    ],
    
    callbacks : {
        async jwt({ token, user }) {
            if (user) {
                token.username = user.username;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.username = token.username;
                session.user.email = token.email?? "";
                session.user.role = token.role;
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

