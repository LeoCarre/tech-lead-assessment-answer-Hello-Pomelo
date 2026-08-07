"use client";

import { Label } from "@/components/ui/label";
import { useThemeConfig } from "@/components/active-theme";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BanIcon } from "lucide-react";

export function ThemeRadiusSelector() {
  const { theme, setTheme } = useThemeConfig();

  return (
    <div className="flex flex-col gap-3">
      <Label>Radius:</Label>
      <ToggleGroup
        className="w-full"
        value={[theme.radius]}
        onValueChange={(value) => {
          const next = value[0];
          if (next) setTheme({ ...theme, radius: next as typeof theme.radius });
        }}
      >
        <ToggleGroupItem variant="outline" className="grow" value="none">
          <BanIcon />
        </ToggleGroupItem>
        <ToggleGroupItem variant="outline" className="grow" value="sm">
          SM
        </ToggleGroupItem>
        <ToggleGroupItem variant="outline" className="grow" value="md">
          MD
        </ToggleGroupItem>
        <ToggleGroupItem variant="outline" className="grow" value="lg">
          LG
        </ToggleGroupItem>
        <ToggleGroupItem variant="outline" className="grow" value="xl">
          XL
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
