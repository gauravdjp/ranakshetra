"use client";
import { useState } from "react";
import StandardBracket from "@/components/braceng1";
import ByeBracket from "@/components/braceng2";

export default function BracketEngine() {
  const [count, setCount] = useState(0);
  const [generated, setGenerated] = useState(false);

  const isPowerOfTwo = (n: number) => n > 0 && (n & (n - 1)) === 0;

  const handleGenerate = () => {
    if (count < 2) return;
    setGenerated(true);
  };

  return (
    <>
      <h1>Bracket Engine</h1>
      <input
        type="number"
        placeholder="enter no. of participants"
        onChange={(e) => {
          setGenerated(false);
          setCount(Number(e.target.value));
        }}
      />
      <button onClick={handleGenerate}>Generate Bracket</button>
{/*
      {generated && (
        isPowerOfTwo(count)
            ? <StandardBracket participants={count} />
            : <ByeBracket participants={count} />
        )}*/}
    </>
  );
}