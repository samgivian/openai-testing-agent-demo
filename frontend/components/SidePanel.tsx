"use client";

import React, { useEffect, useRef, useState } from "react";
import { Dot } from "lucide-react";
import useConversationStore from "@/stores/useConversationStore";
import useTestCaseStore from "@/stores/useTestCaseStore";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function SidePanel() {
  const conversationItems = useConversationStore((s) => s.conversationItems);
  const addConversationItem = useConversationStore((s) => s.addConversationItem);
  const setTestCase = useTestCaseStore((s) => s.setTestCase);

  const [scenario, setScenario] = useState("");
  const [loading, setLoading] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [conversationItems]);

  const handleGenerate = async () => {
    if (!scenario.trim()) return;
    setLoading(true);
    addConversationItem({
      content: scenario,
      timestamp: new Date().toLocaleTimeString(),
    });
    try {
      const res = await fetch("http://localhost:4000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario }),
      });
      const data = await res.json();
      setTestCase(data.testCase || "");
      addConversationItem({
        content: "Test case generated and inserted",
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (err) {
      addConversationItem({
        content: "Error generating test case",
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col border-l bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30 shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">Agent Messages</h3>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0">
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 space-y-3 scroll-smooth"
        >
          {conversationItems.map((m, i) => (
            <div key={i} className="flex gap-2 items-start">
              <Dot size={32} className="text-green-500" />
              <div className="flex-1 flex flex-col gap-1 mt-1">
                <div className="text-sm">{m.content}</div>
                <div className="text-xs text-muted-foreground">
                  {m.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-2 border-t space-y-2">
          <Textarea
            placeholder="Describe your scenario..."
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            className="min-h-[80px]"
          />
          <Button onClick={handleGenerate} disabled={loading} className="w-full">
            {loading ? "Generating..." : "Generate Test"}
          </Button>
        </div>
      </div>
    </div>
  );
}
