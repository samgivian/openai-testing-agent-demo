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
    color: "",
    size: "",
    shouldClick: false,
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
    setForm({ url: "", text: "", color: "", size: "", shouldClick: false });
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
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="size">Size</Label>
            <Input
              id="size"
              value={form.size}
              onChange={(e) => setForm({ ...form, size: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="shouldClick"
              type="checkbox"
              checked={form.shouldClick}
              onChange={(e) =>
                setForm({ ...form, shouldClick: e.target.checked })
              }
            />
            <Label htmlFor="shouldClick">Requires click</Label>
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
