"use client";

import React from "react";
import BananaAnimation from "@/components/BananaAnimation";

export default function AppHeader() {
  return (
    <div className="mt-4 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <BananaAnimation className="w-28 sm:w-36 md:w-40" />
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Automated Testing Agent</h1>
          <p className="text-muted-foreground text-base">
            Authors and executes tests on your behalf using the
            OpenAI&nbsp;CUA model.
          </p>
        </div>
      </div>
    </div>
  );
}
