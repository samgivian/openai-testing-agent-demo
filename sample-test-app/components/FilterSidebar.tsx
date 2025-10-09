"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { categoryFilter } from "@/lib/shopConfig";
import { ChevronDown, ChevronRight } from "lucide-react";
import { filterConfig } from "@/lib/filterConfig";
import { StyleFilters, useStyleFiltersStore } from "@/stores/styleFiltersStore";
import { Checkbox } from "@/components/ui/checkbox";
import GradientColorPicker from "@/components/GradientColorPicker";
import { COLOR_HEX_MAP, findNearestColorName } from "@/lib/colorMap";
import { Separator } from "@/components/ui/separator";
import clsx from "clsx";
export default function FilterSidebar() {
  const { clearFilters, toggleFilter, ...filters } = useStyleFiltersStore();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      filterConfig.map(
        (g) => [g.title, g.title === "Department"] as [string, boolean]
      )
    )
  );
  const [selectedColor, setSelectedColor] = useState<
    { name: string; hex: string } | null
  >(null);

  const pathname = usePathname();
  useEffect(() => {
    // Reset filters on mount
    clearFilters();
    // If on a specific shop category with a default category filter, open the Categories group
    const segments = pathname?.split("/") || [];
    const cat = segments[2];
    if (cat && categoryFilter[cat] != null) {
      setOpenGroups((prev) => ({ ...prev, Categories: true }));
    }
  }, [clearFilters, pathname]);

  useEffect(() => {
    if (filters.color.length === 1) {
      const name = filters.color[0];
      const hex = COLOR_HEX_MAP[name];
      if (hex) setSelectedColor({ name, hex });
    } else if (filters.color.length === 0) {
      setSelectedColor(null);
    }
  }, [filters.color]);

  // Determine if current category should hide the "Categories" group
  const segments = pathname?.split("/") || [];
  const currentCat = segments[2];
  const hideCategories = ["shoes", "clothes", "accessories"].includes(
    currentCat
  );
  // Filter out the Categories group on specific category pages
  const visibleConfig = filterConfig.filter(
    (g) => !(g.title === "Categories" && hideCategories)
  );
  return (
    <aside className="w-full bg-white p-6 border-y border-stone-200 sticky top-16 max-h-[80vh] overflow-y-auto">
      {visibleConfig.map((group) => {
        const isOpen = openGroups[group.title];
        const clearGroup = () => {
          if (group.filterKey) {
            // clear only this group's selections
            useStyleFiltersStore.setState({
              [group.filterKey]: [] as string[],
            });
          }
          if (group.filterKey === "color") {
            setSelectedColor(null);
          }
        };
        return (
          <div key={group.title} className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium text-stone-900">{group.title}</span>
              <div className="items-center gap-2 hidden md:flex">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearGroup();
                  }}
                  className="text-xs text-stone-600 hover:text-stone-900 transition-colors duration-200 cursor-pointer"
                >
                  Clear
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenGroups((prev) => ({
                      ...prev,
                      [group.title]: !prev[group.title],
                    }));
                  }}
                  className="text-stone-500 hover:text-stone-700"
                >
                  {isOpen ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>
              </div>
            </div>
            {isOpen && (
              <div
                className={
                  group.filterKey === "color"
                    ? "space-y-4"
                    : "space-y-2"
                }
              >
                {group.filterKey === "color" && (
                  <>
                    <GradientColorPicker
                      value={selectedColor?.hex}
                      onChange={(hex) => {
                        const match = findNearestColorName(hex);
                        if (!match) return;
                        setSelectedColor(match);
                        useStyleFiltersStore.setState({
                          color: [match.name],
                        });
                      }}
                    />
                    <div className="text-xs text-stone-600">
                      {selectedColor ? (
                        <span>
                          Closest match: {" "}
                          <span className="font-medium text-stone-800">
                            {selectedColor.name}
                          </span>
                        </span>
                      ) : (
                        <span>
                          Choose any shade from the gradient to filter by the
                          nearest color.
                        </span>
                      )}
                    </div>
                    <Separator />
                  </>
                )}
                <div
                  className={clsx(
                    group.filterKey === "color"
                      ? "grid grid-cols-2 gap-2"
                      : "space-y-2"
                  )}
                >
                  {group.items.map((item) => {
                    const checked =
                      group.filterKey &&
                      filters[
                        group.filterKey as keyof typeof filters
                      ]?.includes(item.filterValue);

                    if (group.filterKey === "color") {
                      return (
                        <button
                          type="button"
                          key={item.title}
                          onClick={() => {
                            toggleFilter({
                              key: "color",
                              value: item.filterValue,
                            });
                            if (checked) {
                              setSelectedColor(null);
                            } else {
                              const hex = COLOR_HEX_MAP[item.title];
                              if (hex) setSelectedColor({ name: item.title, hex });
                            }
                          }}
                          className={clsx(
                            "flex items-center gap-2 rounded-md border border-stone-200 bg-white p-2 text-left text-sm transition hover:border-stone-400",
                            checked ? "border-stone-500" : ""
                          )}
                        >
                          <span
                            className="inline-flex h-5 w-5 shrink-0 rounded-full border border-stone-300"
                            style={{
                              backgroundColor:
                                COLOR_HEX_MAP[item.title] ?? "#d1d5db",
                            }}
                          />
                          <span
                            className={
                              checked ? "text-stone-900" : "text-stone-700"
                            }
                          >
                            {item.title}
                          </span>
                        </button>
                      );
                    }

                    return (
                      <label
                        key={item.title}
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <Checkbox
                          className="mr-2"
                          checked={!!checked}
                          onCheckedChange={() =>
                            group.filterKey &&
                            toggleFilter({
                              key: group.filterKey as keyof StyleFilters,
                              value: item.filterValue,
                            })
                          }
                        />
                        <span
                          className={
                            checked ? "text-stone-900" : "text-stone-700"
                          }
                        >
                          {item.title}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
}
