import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Tournaments(){
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) redirect("/signin");
    return(
        <>
        <h1>YOU WILL SEE ALL KIND OF ARENA HERE</h1>
        </>
    )
}