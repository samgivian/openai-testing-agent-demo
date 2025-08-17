"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function TestCaseGenerator() {
  const [scenario, setScenario] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario }),
      });
      const data = await res.json();
      setCode(data.testCase || "");
    } catch (err) {
      console.error("generate", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Describe the scenario to test"
        value={scenario}
        onChange={(e) => setScenario(e.target.value)}
        className="bg-slate-800 text-slate-100 border-slate-700"
        rows={5}
      />
      <Button
        onClick={generate}
        disabled={loading || !scenario.trim()}
        variant="builder"
        className="w-full"
      >
        {loading ? "Generating..." : "Generate Test"}
      </Button>
      <Textarea
        placeholder="Playwright test code will appear here"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="font-mono bg-slate-800 text-slate-100 border-slate-700 min-h-[200px]"
      />
    </div>
  );
}

