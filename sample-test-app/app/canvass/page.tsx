"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImageIcon, Paintbrush, Type, Hand } from "lucide-react";

type ToolId = "edit" | "image" | "text" | "pan";

const TOOLBAR_TOOLS: {
  id: ToolId;
  label: string;
  description: string;
  Icon: typeof Paintbrush;
}[] = [
  {
    id: "edit",
    label: "Edit",
    description: "Fine tune shapes and colors",
    Icon: Paintbrush,
  },
  {
    id: "image",
    label: "Image",
    description: "Drop in imagery from your library",
    Icon: ImageIcon,
  },
  {
    id: "text",
    label: "Text",
    description: "Add headings or paragraphs",
    Icon: Type,
  },
  {
    id: "pan",
    label: "Pan",
    description: "Reposition your artboard",
    Icon: Hand,
  },
];

export default function CanvassPage() {
  const [toolbarOpen, setToolbarOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [selectedTool, setSelectedTool] = useState<ToolId>("edit");

  const handleCanvasInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      setToolbarOpen(true);
    }
  };

  const toggleToolbar = () => {
    setToolbarOpen((prev) => !prev);
    setHasInteracted(true);
  };

  return (
    <main className="min-h-screen bg-stone-50 py-10">
      <div className="max-w-5xl mx-auto px-4 space-y-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-stone-900">
              Marketing Canvass
            </h1>
            <p className="text-stone-600">
              Tap anywhere on the artboard to open your editing tools.
            </p>
          </div>
          <Button
            type="button"
            variant={toolbarOpen ? "secondary" : "outline"}
            data-testid="toolbar-toggle"
            onClick={toggleToolbar}
            aria-pressed={toolbarOpen}
            className="shrink-0"
          >
            {toolbarOpen ? "Hide toolbar" : "Show toolbar"}
          </Button>
        </header>

        <section className="relative rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
          <div
            data-testid="design-canvas"
            role="presentation"
            onPointerDown={handleCanvasInteraction}
            onTouchStart={handleCanvasInteraction}
            onMouseDown={handleCanvasInteraction}
            className="aspect-[3/2] w-full bg-gradient-to-br from-stone-200 via-stone-100 to-stone-200 flex items-center justify-center text-stone-500 text-lg select-none"
          >
            Tap to start designing
          </div>

          <div
            data-testid="editor-toolbar"
            aria-hidden={!toolbarOpen}
            className={cn(
              "absolute inset-x-0 bottom-0 flex flex-col gap-4 border-t border-stone-200 bg-white/95 p-5 backdrop-blur transition-all duration-200",
              toolbarOpen
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-full opacity-0"
            )}
          >
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-stone-500">
              <span>Toolbar</span>
              <span>{selectedTool === "edit" ? "Editing" : "Browsing"}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              {TOOLBAR_TOOLS.map(({ id, label, description, Icon }) => {
                const isActive = selectedTool === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedTool(id)}
                    data-active={isActive}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border border-stone-200 p-3 text-left transition-all duration-200",
                      isActive
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50"
                    )}
                    aria-pressed={isActive}
                  >
                    <span
                      className={cn(
                        "inline-flex h-10 w-10 items-center justify-center rounded-lg border",
                        isActive
                          ? "border-primary-foreground/40 bg-primary-foreground/20 text-primary-foreground"
                          : "border-stone-200 bg-stone-100 text-stone-500"
                      )}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-medium">{label}</span>
                      <span className="mt-1 block text-xs text-stone-500">
                        {description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
