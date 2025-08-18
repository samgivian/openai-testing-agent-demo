"use client";

import { useCallback, useEffect, useState } from "react";
import TestCaseGenerator from "@/components/TestCaseGenerator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ELEMENTS = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "a",
  "button",
  "input",
] as const;
type ElementTag = (typeof ELEMENTS)[number];

type Item =
  | {
      kind: "element";
      type: ElementTag;
      text: string;
      color?: string;
      fontFamily?: string;
      fontWeight?: string;
      fontSize?: string;
      strict?: boolean;
      shouldClick?: boolean;
      href?: string;
      checkNavigation?: boolean;
      navigationUrl?: string;
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
    fontWeight: "",
    fontSize: "",
    strict: false,
    shouldClick: false,
    href: "",
    checkNavigation: false,
    navigationUrl: "",
  });
  const [specText, setSpecText] = useState("");
  const [specEdited, setSpecEdited] = useState(false);

  const escape = (str: string) =>
    str.replace(/\\/g, "\\\\").replace(/'/g, "\\'");

  const normalizeColor = (color: string) => {
    const el = document.createElement("div");
    el.style.color = color;
    document.body.appendChild(el);
    const computed = getComputedStyle(el).color;
    document.body.removeChild(el);
    return computed.replace(
      /rgba\((\d+), (\d+), (\d+), [^\)]+\)/,
      "rgb($1, $2, $3)"
    );
  };

  const updateCurrentTest = (items: Item[]) => {
    const updated = [...tests];
    updated[currentTest] = { ...updated[currentTest], items };
    setTests(updated);
  };

  const addItem = (type: ElementTag) => {
    setNewElementTag(type);
    setFormData({
      text: "",
      color: "",
      fontFamily: "",
      fontWeight: "",
      fontSize: "",
      strict: false,
      shouldClick: false,
      href: "",
      checkNavigation: false,
      navigationUrl: "",
    });
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
        fontWeight: formData.fontWeight.trim() || undefined,
        fontSize: formData.fontSize.trim() || undefined,
        strict: formData.strict,
        shouldClick: formData.shouldClick,
        href:
          newElementTag === "a" ? formData.href.trim() || undefined : undefined,
        checkNavigation: formData.shouldClick ? formData.checkNavigation : undefined,
        navigationUrl:
          formData.shouldClick && formData.checkNavigation
            ? formData.navigationUrl.trim() || undefined
            : undefined,
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

  const generateSpec = useCallback(() => {
    const lines = ["import { test, expect } from '@playwright/test';", ""];
    tests.forEach((t) => {
      lines.push(`test('${escape(t.name)}', async ({ page }) => {`);
      lines.push(`  await page.goto('${escape(route)}');`);
      t.items.forEach((item, idx) => {
        if (item.kind === "element") {
          const textEscaped = item.text
            .replace(/\\/g, "\\\\")
            .replace(/"/g, '\\"');
          const selector =
            item.type === "input"
              ? `input[placeholder="${textEscaped}"]`
              : `${item.type}:has-text("${textEscaped}")`;
          const varName = `locator${idx}`;
          if (item.strict) {
            lines.push(`  const ${varName} = page.locator('${selector}');`);
          } else {
            lines.push(
              `  const ${varName} = page.locator('${selector}').nth(0);`
            );
          }
          lines.push(`  await expect(${varName}).toBeVisible();`);
          if (item.type === "input") {
            lines.push(
              `  await expect(${varName}).toHaveAttribute('placeholder', '${escape(
                item.text
              )}');`
            );
          }
          if (item.color) {
            const color = normalizeColor(item.color);
            lines.push(
              `  await expect(${varName}).toHaveCSS('color', '${color}');`
            );
          }
          if (item.fontFamily) {
            lines.push(
              `  await expect(${varName}).toHaveCSS('font-family', '${item.fontFamily}');`
            );
          }
          if (item.fontWeight) {
            lines.push(
              `  await expect(${varName}).toHaveCSS('font-weight', '${item.fontWeight}');`
            );
          }
          if (item.fontSize) {
            lines.push(
              `  await expect(${varName}).toHaveCSS('font-size', '${item.fontSize}');`
            );
          }
          if (item.type === "a" && item.href) {
            const href = escape(item.href);
            lines.push(
              `  await expect(${varName}).toHaveAttribute('href', '${href}');`
            );
          }
          if (item.shouldClick || item.checkNavigation) {
            lines.push(`  await ${varName}.click();`);
          }
          if (item.checkNavigation && item.navigationUrl) {
            const navUrl = escape(item.navigationUrl);
            lines.push(`  await expect(page).toHaveURL('${navUrl}');`);
            lines.push(`  await page.goto('${escape(route)}');`);
          }
        } else if (item.kind === "scroll") {
          lines.push(`  await page.mouse.wheel(0, ${item.amount});`);
        }
      });
      lines.push("});");
      lines.push("");
    });
    return lines.join("\n");
  }, [tests, route]);

  useEffect(() => {
    if (!specEdited) {
      setSpecText(generateSpec());
    }
  }, [generateSpec, specEdited]);

  const regenerateSpec = () => {
    setSpecEdited(false);
    setSpecText(generateSpec());
  };

  const downloadSpec = () => {
    const blob = new Blob([specText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "generated.spec.ts";
    a.click();
    URL.revokeObjectURL(url);
  };

  const copySpec = async () => {
    try {
      await navigator.clipboard.writeText(specText);
      alert("Test suite copied to clipboard");
    } catch (err) {
      alert("Copy failed: " + err);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <aside className="w-48 p-4 border-r border-border space-y-2 bg-card overflow-y-auto">
        <Button onClick={setRouteHandler} className="w-full" variant="builder">
          Set Route
        </Button>
        {tests.map((t, idx) => (
          <Button
            key={idx}
            onClick={() => setCurrentTest(idx)}
            className="w-full"
            variant={idx === currentTest ? "builder" : "secondary"}
          >
            {t.name}
          </Button>
        ))}
        <Button onClick={addTestCase} className="w-full" variant="builder">
          Add Test Case
        </Button>
        {ELEMENTS.map((el) => (
          <Button
            key={el}
            onClick={() => addItem(el)}
            className="w-full"
            variant="builder"
          >
            {el.toUpperCase()}
          </Button>
        ))}
        <Button onClick={addScroll} className="w-full" variant="builder">
          Scroll
        </Button>
        {(hasAnyItems || tests[currentTest].items.length > 0) && (
          <div className="pt-2 space-y-2 border-t mt-2">
            {hasAnyItems && (
              <>
                <Button
                  onClick={copySpec}
                  className="w-full"
                  variant="builder"
                >
                  Copy Tests
                </Button>
                <Button
                  onClick={downloadSpec}
                  className="w-full"
                  variant="builder"
                >
                  Download Tests
                </Button>
              </>
            )}
            {tests[currentTest].items.length > 0 && (
              <Button
                onClick={clearItems}
                className="w-full"
                variant="destructive"
              >
                Clear Current Test
              </Button>
            )}
          </div>
        )}
      </aside>
      <main className="flex-1 flex">
        <div className="flex-1 p-4 overflow-auto">
          {tests[currentTest].items.map((item, idx) => {
            if (item.kind === "element") {
              if (item.type === "input") {
                return (
                  <input
                    key={idx}
                    className="mb-2 px-2 py-1 rounded border border-border bg-input text-foreground"
                    placeholder={item.text}
                    style={{
                      color: item.color,
                      fontFamily: item.fontFamily,
                      fontWeight: item.fontWeight,
                      fontSize: item.fontSize,
                    }}
                  />
                );
              }
              const Tag = item.type as keyof JSX.IntrinsicElements;
              const anchorProps =
                item.type === "a" && item.href ? { href: item.href } : {};
              return (
                <Tag
                  key={idx}
                  className="mb-2"
                  style={{
                    color: item.color,
                    fontFamily: item.fontFamily,
                    fontWeight: item.fontWeight,
                    fontSize: item.fontSize,
                  }}
                  {...anchorProps}
                >
                  {item.text}
                </Tag>
              );
            }
            return (
              <p key={idx} className="mb-2 text-muted-foreground">
                Scroll {item.amount}px
              </p>
            );
          })}
          {hasAnyItems && (
            <div className="mt-4">
              <h2 className="font-semibold mb-2">Generated Test Suite</h2>
              <Textarea
                className="font-mono bg-card text-foreground border-border"
                rows={10}
                value={specText}
                onChange={(e) => {
                  setSpecEdited(true);
                  setSpecText(e.target.value);
                }}
              />
              {specEdited && (
                <Button
                  onClick={regenerateSpec}
                  variant="builder"
                  className="mt-2"
                >
                  Reset to Generated Code
                </Button>
              )}
            </div>
          )}
        </div>
        <div className="w-96 p-4 border-l border-border overflow-auto bg-card">
          <TestCaseGenerator />
        </div>
      </main>
      {newElementTag && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <Card className="w-80">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitItem();
              }}
            >
              <CardHeader>
                <CardTitle>Add {newElementTag.toUpperCase()}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Input
                  placeholder="Text"
                  value={formData.text}
                  onChange={(e) =>
                    setFormData({ ...formData, text: e.target.value })
                  }
                />
                <Input
                  placeholder="Color (optional)"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                />
                <Input
                  placeholder="Font family (optional)"
                  value={formData.fontFamily}
                  onChange={(e) =>
                    setFormData({ ...formData, fontFamily: e.target.value })
                  }
                />
                <Input
                  placeholder="Font weight (optional)"
                  value={formData.fontWeight}
                  onChange={(e) =>
                    setFormData({ ...formData, fontWeight: e.target.value })
                  }
                />
                <Input
                  placeholder="Font size (optional)"
                  value={formData.fontSize}
                  onChange={(e) =>
                    setFormData({ ...formData, fontSize: e.target.value })
                  }
                />
                {newElementTag === "a" && (
                  <Input
                    placeholder="Link URL (href)"
                    value={formData.href}
                    onChange={(e) =>
                      setFormData({ ...formData, href: e.target.value })
                    }
                  />
                )}
                <div className="flex items-center justify-between">
                  <Label htmlFor="shouldClick" className="text-sm">
                    Verify click
                  </Label>
                  <Switch
                    id="shouldClick"
                    checked={formData.shouldClick}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        shouldClick: checked,
                        checkNavigation: checked
                          ? formData.checkNavigation
                          : false,
                      })
                    }
                  />
                </div>
                {formData.shouldClick && (
                  <div className="flex items-center justify-between">
                    <Label htmlFor="checkNavigation" className="text-sm">
                      Check navigation
                    </Label>
                    <Switch
                      id="checkNavigation"
                      checked={formData.checkNavigation}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          checkNavigation: checked,
                        })
                      }
                    />
                  </div>
                )}
                {formData.shouldClick && formData.checkNavigation && (
                  <Input
                    placeholder="Navigation URL"
                    value={formData.navigationUrl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        navigationUrl: e.target.value,
                      })
                    }
                  />
                )}
                <div className="flex items-center justify-between">
                  <Label htmlFor="strict" className="text-sm">
                    Use strict locator
                  </Label>
                  <Switch
                    id="strict"
                    checked={formData.strict}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, strict: checked })
                    }
                  />
                </div>
              </CardContent>
              <CardFooter className="justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNewElementTag(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="builder">Add</Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

