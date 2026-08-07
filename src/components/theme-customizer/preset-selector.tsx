"use client";

import { DEFAULT_THEME, THEMES, type ThemePreset } from "@/lib/themes";
import { useThemeConfig } from "@/components/active-theme";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function PresetSelector() {
  const { theme, setTheme } = useThemeConfig();

  const handlePreset = (value: string | null) => {
    if (!value) return;
    setTheme({
      ...theme,
      ...DEFAULT_THEME,
      preset: value as ThemePreset,
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <Label>Theme preset:</Label>
      <Select value={theme.preset} onValueChange={handlePreset}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a theme" />
        </SelectTrigger>
        <SelectContent align="end">
          {THEMES.map((t) => (
            <SelectItem key={t.name} value={t.value}>
              <div className="flex shrink-0 gap-1">
                {t.colors.map((color, key) => (
                  <span
                    key={key}
                    className="size-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
