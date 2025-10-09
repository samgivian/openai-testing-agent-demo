import { hexToRgb } from "@/lib/colorUtils";

export const COLOR_HEX_MAP: Record<string, string> = {
  Mauve: "#8e5a87",
  Multi: "#d16ba5",
  Copper: "#b87333",
  Brown: "#8b4513",
  Orange: "#ff7f11",
  Rose: "#ff6f91",
  Purple: "#7e57c2",
  Grey: "#9e9e9e",
  "Navy Blue": "#1a237e",
  Tan: "#d2b48c",
  Taupe: "#8b8589",
  Yellow: "#ffd60a",
  "Off White": "#f5f5f0",
  Olive: "#708238",
  Bronze: "#b08d57",
  Metallic: "#a7adb0",
  Lavender: "#b57edc",
  "Sea Green": "#2e8b57",
  "Coffee Brown": "#4b3621",
  Skin: "#f7c8a0",
  "Grey Melange": "#b0b0b0",
  "Mushroom Brown": "#b49f86",
  Red: "#d7263d",
  Mustard: "#d4a017",
  "Lime Green": "#9acd32",
  Silver: "#c0c0c0",
  Teal: "#008080",
  White: "#ffffff",
  Green: "#2e7d32",
  Rust: "#b7410e",
  Gold: "#d4af37",
  Black: "#000000",
  Peach: "#ffb085",
  Blue: "#1976d2",
  Beige: "#f5f5dc",
  Cream: "#fff4d1",
  Burgundy: "#800020",
  Maroon: "#7b1113",
  Magenta: "#d81b60",
  Pink: "#ff80ab",
  Khaki: "#c3b091",
  Steel: "#7f8c8d",
  Nude: "#e3bc9a",
  "Turquoise Blue": "#00bcd4",
  Charcoal: "#36454f",
};

const COLOR_ENTRIES = Object.entries(COLOR_HEX_MAP).map(([name, hex]) => ({
  name,
  rgb: hexToRgb(hex),
}));

export function findNearestColorName(hex: string): {
  name: string;
  hex: string;
} | null {
  if (!hex) return null;
  const target = hexToRgb(hex);
  let closest: { name: string; hex: string } | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const entry of COLOR_ENTRIES) {
    const distance =
      (entry.rgb.r - target.r) ** 2 +
      (entry.rgb.g - target.g) ** 2 +
      (entry.rgb.b - target.b) ** 2;

    if (distance < bestDistance) {
      bestDistance = distance;
      closest = { name: entry.name, hex: COLOR_HEX_MAP[entry.name] };
    }
  }

  return closest;
}
