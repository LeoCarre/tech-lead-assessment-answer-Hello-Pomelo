"use client";

import { Label } from "@/components/ui/label";
import { useThemeConfig } from "@/components/active-theme";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BanIcon } from "lucide-react";

export function ThemeScaleSelector() {
  const { theme, setTheme } = useThemeConfig();

  return (
    <div className="flex flex-col gap-3">
      <Label>Scale:</Label>
      <ToggleGroup
        className="w-full"
        value={[theme.scale]}
        onValueChange={(value) => {
          const next = value[0];
          if (next) setTheme({ ...theme, scale: next as typeof theme.scale });
        }}
      >
        <ToggleGroupItem variant="outline" className="grow" value="none">
          <BanIcon />
        </ToggleGroupItem>
        <ToggleGroupItem variant="outline" className="grow" value="sm">
          XS
        </ToggleGroupItem>
        <ToggleGroupItem variant="outline" className="grow" value="lg">
          LG
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
