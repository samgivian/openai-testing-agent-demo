"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TestItem } from "@/types/testItem";

interface TestItemDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (item: TestItem) => void;
}

export default function TestItemDialog({ open, onClose, onAdd }: TestItemDialogProps) {
  const [form, setForm] = useState<TestItem>({
    url: "",
    text: "",
    shouldClick: false,
    checkNavigation: false,
    fontColor: "",
    fontSize: "",
    fontFamily: "",
    fontType: "",
    navigationUrl: "",
    eventName: "",
  });
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(form.url, { method: "HEAD" });
      if (!res.ok) {
        setError("Invalid link");
        return;
      }
    } catch {
      setError("Invalid link");
      return;
    }
    onAdd(form);
    setForm({
      url: "",
      text: "",
      shouldClick: false,
      checkNavigation: false,
      fontColor: "",
      fontSize: "",
      fontFamily: "",
      fontType: "",
      navigationUrl: "",
      eventName: "",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-md bg-background p-4 space-y-4">
        <h2 className="text-lg font-semibold">Add Test Item</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="url">Link URL</Label>
            <Input
              id="url"
              type="url"
              required
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="text">Text</Label>
            <Input
              id="text"
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fontColor">Font Color</Label>
            <Input
              id="fontColor"
              value={form.fontColor}
              onChange={(e) => setForm({ ...form, fontColor: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fontSize">Font Size</Label>
            <Input
              id="fontSize"
              value={form.fontSize}
              onChange={(e) => setForm({ ...form, fontSize: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fontFamily">Font Family</Label>
            <Input
              id="fontFamily"
              value={form.fontFamily}
              onChange={(e) => setForm({ ...form, fontFamily: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fontType">Font Type</Label>
            <Input
              id="fontType"
              value={form.fontType}
              onChange={(e) => setForm({ ...form, fontType: e.target.value })}
            />
          </div>
          {form.checkNavigation && (
            <div className="space-y-2">
              <Label htmlFor="navigationUrl">Navigation URL</Label>
              <Input
                id="navigationUrl"
                value={form.navigationUrl}
                onChange={(e) =>
                  setForm({ ...form, navigationUrl: e.target.value })
                }
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="eventName">Event Name</Label>
            <Input
              id="eventName"
              value={form.eventName}
              onChange={(e) => setForm({ ...form, eventName: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                id="shouldClick"
                type="checkbox"
                checked={form.shouldClick}
                onChange={(e) =>
                  setForm({ ...form, shouldClick: e.target.checked })
                }
              />
              <Label htmlFor="shouldClick">Verify click</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="checkNavigation"
                type="checkbox"
                checked={form.checkNavigation}
                onChange={(e) =>
                  setForm({
                    ...form,
                    checkNavigation: e.target.checked,
                  })
                }
              />
              <Label htmlFor="checkNavigation">Check navigation</Label>
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
