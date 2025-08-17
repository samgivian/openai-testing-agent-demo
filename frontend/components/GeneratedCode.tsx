"use client";

import useCodeStore from "@/stores/useCodeStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { duotoneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function GeneratedCode() {
  const code = useCodeStore((s) => s.testCode);
  if (!code) return null;
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Generated Playwright Code</CardTitle>
        </CardHeader>
        <CardContent>
          <SyntaxHighlighter
            language="typescript"
            style={duotoneLight}
            showLineNumbers
          >
            {code}
          </SyntaxHighlighter>
        </CardContent>
      </Card>
    </div>
  );
}
