"use client";

import { useState } from "react";

const ELEMENTS = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "button"] as const;
type ElementTag = (typeof ELEMENTS)[number];
interface Item {
  type: ElementTag;
  text: string;
}

export default function TestBuilder() {
  const [items, setItems] = useState<Item[]>([]);

  const addItem = (type: ElementTag) => {
    const text = prompt(`Enter text for ${type.toUpperCase()}`);
    if (text && text.trim()) {
      setItems([...items, { type, text: text.trim() }]);
    }
  };

  const generateSpec = () => {
    const lines = [
      "import { test, expect } from '@playwright/test';",
      "",
      "test('generated elements', async ({ page }) => {",
      "  await page.goto('http://localhost:3000/test-builder');",
    ];
    items.forEach((item) => {
      const selector = `${item.type}:has-text(\"${item.text.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}\")`;
      lines.push(`  await expect(page.locator('${selector}')).toBeVisible();`);
    });
    lines.push("});");
    return lines.join("\n");
  };

  const downloadSpec = () => {
    const blob = new Blob([generateSpec()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "generated.spec.ts";
    a.click();
    URL.revokeObjectURL(url);
  };

  const copySpec = async () => {
    try {
      await navigator.clipboard.writeText(generateSpec());
      alert("Test suite copied to clipboard");
    } catch (err) {
      alert("Copy failed: " + err);
    }
  };

  return (
    <div className="flex h-full">
      <aside className="w-48 p-4 border-r space-y-2 bg-white">
        {ELEMENTS.map((el) => (
          <button
            key={el}
            onClick={() => addItem(el)}
            className="w-full px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {el.toUpperCase()}
          </button>
        ))}
        {items.length > 0 && (
          <div className="pt-2 space-y-2 border-t mt-2">
            <button
              onClick={copySpec}
              className="w-full px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Copy Tests
            </button>
            <button
              onClick={downloadSpec}
              className="w-full px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Download Tests
            </button>
          </div>
        )}
      </aside>
      <main className="flex-1 p-4 overflow-auto">
        {items.map((item, idx) => {
          const Tag = item.type as keyof JSX.IntrinsicElements;
          return (
            <Tag key={idx} className="mb-2">
              {item.text}
            </Tag>
          );
        })}
        {items.length > 0 && (
          <div className="mt-4">
            <h2 className="font-semibold mb-2">Generated Test Suite</h2>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto whitespace-pre-wrap">
              {generateSpec()}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}

