"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { hexToHsv, hsvToHex } from "@/lib/colorUtils";

interface GradientColorPickerProps {
  value?: string;
  onChange?: (hex: string) => void;
}

const DEFAULT_HEX = "#ff0000";

type SliderStyle = React.CSSProperties & {
  "--thumb-color"?: string;
};

export default function GradientColorPicker({
  value = DEFAULT_HEX,
  onChange,
}: GradientColorPickerProps) {
  const squareRef = useRef<HTMLDivElement | null>(null);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(1);
  const [brightness, setBrightness] = useState(1);

  useEffect(() => {
    if (!value) return;
    const { h, s, v } = hexToHsv(value);
    setHue(h);
    setSaturation(s);
    setBrightness(v);
  }, [value]);

  const currentHex = useMemo(
    () => hsvToHex(hue, saturation, brightness),
    [hue, saturation, brightness]
  );

  const emitChange = useCallback(
    (hex: string) => {
      onChange?.(hex);
    },
    [onChange]
  );

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const rect = squareRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
      const y = Math.min(Math.max(clientY - rect.top, 0), rect.height);

      const nextSaturation = rect.width === 0 ? 0 : x / rect.width;
      const nextBrightness = rect.height === 0 ? 0 : 1 - y / rect.height;

      setSaturation(nextSaturation);
      setBrightness(nextBrightness);
      emitChange(hsvToHex(hue, nextSaturation, nextBrightness));
    },
    [emitChange, hue]
  );

  const handleSquareMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      updateFromPointer(event.clientX, event.clientY);

      const handleMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        updateFromPointer(e.clientX, e.clientY);
      };

      const handleMouseUp = () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [updateFromPointer]
  );

  const handleHueChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextHue = Number(event.target.value);
      setHue(nextHue);
      emitChange(hsvToHex(nextHue, saturation, brightness));
    },
    [brightness, emitChange, saturation]
  );

  const sliderStyle = useMemo<SliderStyle>(
    () => ({
      background:
        "linear-gradient(90deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
      "--thumb-color": `hsl(${hue} 100% 50%)`,
    }),
    [hue]
  );

  return (
    <div className="space-y-3">
      <div
        ref={squareRef}
        className="relative h-48 w-full cursor-crosshair overflow-hidden rounded-lg border border-stone-200"
        onMouseDown={handleSquareMouseDown}
        style={{
          background:
            `linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0)), ` +
            `linear-gradient(to right, #ffffff, hsl(${hue} 100% 50%))`,
        }}
      >
        <div
          className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)]"
          style={{
            left: `${saturation * 100}%`,
            top: `${(1 - brightness) * 100}%`,
            backgroundColor: currentHex,
          }}
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={360}
          value={Math.round(hue)}
          onChange={handleHueChange}
          className="slider-hue h-3 flex-1 rounded-full"
          style={sliderStyle}
        />
        <div
          className="h-10 w-10 rounded-md border border-stone-200"
          style={{ backgroundColor: currentHex }}
        />
      </div>

      <div className="text-xs font-mono uppercase text-stone-600">
        {currentHex.toUpperCase()}
      </div>
    </div>
  );
}
