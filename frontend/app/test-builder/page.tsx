"use client";

import { useState } from "react";

const ELEMENTS = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "a", "button"] as const;
type ElementTag = (typeof ELEMENTS)[number];

type Item =
  | {
      kind: "element";
      type: ElementTag;
      text: string;
      color?: string;
      fontFamily?: string;
      fontSize?: string;
    }
  | { kind: "scroll"; amount: number };

type TestCase = { name: string; items: Item[] };

export default function TestBuilder() {
  const [tests, setTests] = useState<TestCase[]>([
    { name: "Test 1", items: [] },
  ]);
  const [currentTest, setCurrentTest] = useState(0);
  const [route, setRoute] = useState("http://localhost:3000/test-builder");
  const [newElementTag, setNewElementTag] = useState<ElementTag | null>(null);
  const [formData, setFormData] = useState({
    text: "",
    color: "",
    fontFamily: "",
    fontSize: "",
  });

  const escape = (str: string) =>
    str.replace(/\\/g, "\\\\").replace(/'/g, "\\'");

  const updateCurrentTest = (items: Item[]) => {
    const updated = [...tests];
    updated[currentTest] = { ...updated[currentTest], items };
    setTests(updated);
  };

  const addItem = (type: ElementTag) => {
    setNewElementTag(type);
    setFormData({ text: "", color: "", fontFamily: "", fontSize: "" });
  };

  const submitItem = () => {
    if (!newElementTag || !formData.text.trim()) return;
    updateCurrentTest([
      ...tests[currentTest].items,
      {
        kind: "element",
        type: newElementTag,
        text: formData.text.trim(),
        color: formData.color.trim() || undefined,
        fontFamily: formData.fontFamily.trim() || undefined,
        fontSize: formData.fontSize.trim() || undefined,
      },
    ]);
    setNewElementTag(null);
  };

  const addScroll = () => {
    const amt = prompt("Enter scroll amount in pixels");
    if (amt) {
      const value = parseInt(amt, 10);
      if (!isNaN(value)) {
        updateCurrentTest([
          ...tests[currentTest].items,
          { kind: "scroll", amount: value },
        ]);
      }
    }
  };

  const setRouteHandler = () => {
    const url = prompt("Enter route for testing", route);
    if (url && url.trim()) setRoute(url.trim());
  };

  const addTestCase = () => {
    const name = prompt("Enter test name", `Test ${tests.length + 1}`);
    if (name && name.trim()) {
      setTests([...tests, { name: name.trim(), items: [] }]);
      setCurrentTest(tests.length);
    }
  };

  const clearItems = () => updateCurrentTest([]);

  const hasAnyItems = tests.some((t) => t.items.length > 0);

  const generateSpec = () => {
    const lines = ["import { test, expect } from '@playwright/test';", ""];
    tests.forEach((t) => {
      lines.push(`test('${escape(t.name)}', async ({ page }) => {`);
      lines.push(`  await page.goto('${escape(route)}');`);
      t.items.forEach((item) => {
        if (item.kind === "element") {
          const selector = `${item.type}:has-text("${item.text
            .replace(/\\/g, "\\\\")
            .replace(/"/g, '\\"')}")`;
          lines.push(
            `  const locator = page.locator('${selector}', { strict: false });`
          );
          lines.push("  await expect(locator).toBeVisible();");
          if (item.color) {
            lines.push(
              `  await expect(locator).toHaveCSS('color', '${item.color}');`
            );
          }
          if (item.fontFamily) {
            lines.push(
              `  await expect(locator).toHaveCSS('font-family', '${item.fontFamily}');`
            );
          }
          if (item.fontSize) {
            lines.push(
              `  await expect(locator).toHaveCSS('font-size', '${item.fontSize}');`
            );
          }
        } else if (item.kind === "scroll") {
          lines.push(`  await page.mouse.wheel(0, ${item.amount});`);
        }
      });
      lines.push("});");
      lines.push("");
    });
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
        <button
          onClick={setRouteHandler}
          className="w-full px-2 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Set Route
        </button>
        {tests.map((t, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentTest(idx)}
            className={`w-full px-2 py-1 text-sm rounded ${
              idx === currentTest
                ? "bg-purple-500 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {t.name}
          </button>
        ))}
        <button
          onClick={addTestCase}
          className="w-full px-2 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Add Test Case
        </button>
        {ELEMENTS.map((el) => (
          <button
            key={el}
            onClick={() => addItem(el)}
            className="w-full px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {el.toUpperCase()}
          </button>
        ))}
        <button
          onClick={addScroll}
          className="w-full px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Scroll
        </button>
        {(hasAnyItems || tests[currentTest].items.length > 0) && (
          <div className="pt-2 space-y-2 border-t mt-2">
            {hasAnyItems && (
              <>
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
              </>
            )}
            {tests[currentTest].items.length > 0 && (
              <button
                onClick={clearItems}
                className="w-full px-2 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Clear Current Test
              </button>
            )}
          </div>
        )}
      </aside>
      <main className="flex-1 p-4 overflow-auto">
        {tests[currentTest].items.map((item, idx) => {
          if (item.kind === "element") {
            const Tag = item.type as keyof JSX.IntrinsicElements;
            return (
              <Tag
                key={idx}
                className="mb-2"
                style={{
                  color: item.color,
                  fontFamily: item.fontFamily,
                  fontSize: item.fontSize,
                }}
              >
                {item.text}
              </Tag>
            );
          }
          return (
            <p key={idx} className="mb-2 text-gray-500">
              Scroll {item.amount}px
            </p>
          );
        })}
        {hasAnyItems && (
          <div className="mt-4">
            <h2 className="font-semibold mb-2">Generated Test Suite</h2>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto whitespace-pre-wrap">
              {generateSpec()}
            </pre>
          </div>
        )}
      </main>
      {newElementTag && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitItem();
            }}
            className="bg-white p-4 rounded shadow w-80 space-y-2"
          >
            <h3 className="font-semibold">
              Add {newElementTag.toUpperCase()}
            </h3>
            <input
              className="w-full border px-2 py-1"
              placeholder="Text"
              value={formData.text}
              onChange={(e) =>
                setFormData({ ...formData, text: e.target.value })
              }
            />
            <input
              className="w-full border px-2 py-1"
              placeholder="Color (optional)"
              value={formData.color}
              onChange={(e) =>
                setFormData({ ...formData, color: e.target.value })
              }
            />
            <input
              className="w-full border px-2 py-1"
              placeholder="Font family (optional)"
              value={formData.fontFamily}
              onChange={(e) =>
                setFormData({ ...formData, fontFamily: e.target.value })
              }
            />
            <input
              className="w-full border px-2 py-1"
              placeholder="Font size (optional)"
              value={formData.fontSize}
              onChange={(e) =>
                setFormData({ ...formData, fontSize: e.target.value })
              }
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setNewElementTag(null)}
                className="px-2 py-1 text-sm bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

