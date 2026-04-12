"use client";
import dynamic from "next/dynamic";

// Dynamically import StandardBracket with SSR disabled
const StandardBracket = dynamic(() => import("./braceng1"), {
  ssr: false,
});

export default function BracketWrapper({ participants }: { participants: number }) {
  return <StandardBracket participants={participants} />;
}