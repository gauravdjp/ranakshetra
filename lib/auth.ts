import {betterAuth} from "better-auth";
import {mongodbAdapter} from "better-auth/adapters/mongodb";
import clientPromise from "@/lib/mongodb"

const client = await clientPromise; 
const db = client.db("RKS");

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    secret: process.env.BETTER_AUTH_SECRET || process.env.NEXTAUTH_SECRET || "ranakshetra-secret-key-2026",
    database : mongodbAdapter(db),

    emailAndPassword : {
        enabled : true,
    },
    user: {
        additionalFields: {
        username: { type: "string", required: false },
        role: { 
            type: "string", 
            required: false,
            defaultValue: "player", // every new signup defaults to player
        },
        },
    },

    pages : {
        signIn : "/signin",    
    }
});