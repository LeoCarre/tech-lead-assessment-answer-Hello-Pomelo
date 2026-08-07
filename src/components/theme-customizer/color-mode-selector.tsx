"use client";

import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useTheme } from "next-themes";

export function ColorModeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col gap-3">
      <Label>Color mode:</Label>
      <ToggleGroup
        className="w-full"
        value={theme ? [theme] : []}
        onValueChange={(value) => {
          const next = value[0];
          if (next) setTheme(next);
        }}
      >
        <ToggleGroupItem variant="outline" className="grow" value="light">
          Light
        </ToggleGroupItem>
        <ToggleGroupItem variant="outline" className="grow" value="dark">
          Dark
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
