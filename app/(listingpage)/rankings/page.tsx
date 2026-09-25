import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Rankings(){
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) redirect("/signin");
    return(
        <>
        <h1>YOU WILL SEE PLAYERS/ TOP PLAYERS/ RANKINGS/ RATINGS/ CHECK YOUR STANDING TOO, REGIONWISE</h1>
        </>
    )
}