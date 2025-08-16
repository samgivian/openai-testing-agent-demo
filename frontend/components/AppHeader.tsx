"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AppHeader() {
  return (
    <div className="space-y-2 mt-4 mb-8">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          Automated Testing Agent
        </h1>
        <Button asChild variant="outline">
          <Link href="/test-builder">Test Builder</Link>
        </Button>
      </div>
      <p className="text-muted-foreground">
        Authors and executes tests on your behalf using the OpenAI&nbsp;CUA
        model.
      </p>
    </div>
  );
}
