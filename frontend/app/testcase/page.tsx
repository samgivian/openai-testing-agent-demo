"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function TestCaseGenerator() {
  const [scenario, setScenario] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const serverUrl =
    process.env.NEXT_PUBLIC_TESTCASE_SERVER_URL || "http://localhost:4000";

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${serverUrl}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || res.statusText);
      }
      const data = await res.json();
      setCode(data.testCase || "");
    } catch (err) {
      console.error("generate", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
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
      >
        {loading ? "Generating..." : "Generate Test"}
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Textarea
        placeholder="Playwright test code will appear here"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="font-mono bg-slate-800 text-slate-100 border-slate-700 min-h-[200px]"
      />
    </div>
  );
}

