"use client";

import { Label } from "@/components/ui/label";
import { useThemeConfig } from "@/components/active-theme";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function ContentLayoutSelector() {
  const { theme, setTheme } = useThemeConfig();

  return (
    <div className="hidden flex-col gap-3 lg:flex">
      <Label>Content layout</Label>
      <ToggleGroup
        className="w-full"
        value={[theme.contentLayout]}
        onValueChange={(value) => {
          const next = value[0];
          if (next)
            setTheme({
              ...theme,
              contentLayout: next as typeof theme.contentLayout,
            });
        }}
      >
        <ToggleGroupItem variant="outline" className="grow" value="full">
          Full
        </ToggleGroupItem>
        <ToggleGroupItem variant="outline" className="grow" value="centered">
          Centered
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
