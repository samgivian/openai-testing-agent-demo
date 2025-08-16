"use client";

import { useState, FormEvent } from "react";
import { ExternalLink, Send } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { emitTestCaseInitiated } from "@/components/SocketIOManager";
import AppHeader from "@/components/AppHeader";
import { TEST_APP_URL, TEST_CASE } from "@/lib/constants";

interface ConfigPanelProps {
  onSubmitted?: (testCase: string) => void;
}

export default function ConfigPanel({ onSubmitted }: ConfigPanelProps) {
  const [testCase, setTestCase] = useState(TEST_CASE);
  const [url, setUrl] = useState(TEST_APP_URL);
  const [submitting, setSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Submit handler
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setFormSubmitted(true);

    emitTestCaseInitiated({
      testCase,
      url,
    });

    onSubmitted?.(testCase);
  };

  /* Summary view (post-submit) */
  if (formSubmitted) {
    return (
      <div className="w-full flex flex-col gap-8 justify-center items-start p-4 md:p-6 max-w-4xl mx-auto">
        {/* keep the header visible */}
        <AppHeader />

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Test Case</CardTitle>
            <CardDescription>
              Your instructions have been submitted. You can track progress
              below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm">{testCase}</pre>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* Form view (pre-submit) */
  return (
    <div className="w-full flex justify-center items-start p-4 md:p-6 max-w-4xl mx-auto">
      <div className="w-full">
        <AppHeader />

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Configure Test</CardTitle>
              <CardDescription>
                Provide the target application URL and describe the test case.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-3">
                <Label
                  htmlFor="url"
                  className="flex items-center gap-2 whitespace-nowrap w-24"
                >
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  URL
                </Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="http://localhost:3001"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={submitting}
                  className="flex-1"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="test-case">Test instructions</Label>
                <Textarea
                  id="test-case"
                  className="min-h-[200px] resize-y"
                  value={testCase}
                  onChange={(e) => setTestCase(e.target.value)}
                  disabled={submitting}
                />
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button type="submit" className="gap-2" disabled={submitting}>
                <Send className="h-4 w-4" />
                {submitting ? "Submitting…" : "Submit"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
