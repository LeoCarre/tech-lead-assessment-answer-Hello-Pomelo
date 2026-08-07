"use client";

import { useMemo, useState } from "react";
import { ChevronsUpDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  InputGroup,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type MultiSelectOption = {
  value: string;
  label: string;
  description?: string;
  badge?: string;
};

export type MultiSelectQuickFilter = {
  label: string;
  /** Selects every option whose `badge` equals this value. */
  badge: string;
};

export function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
  emptyLabel = "Aucun",
  allLabel = "Tous",
  className,
  triggerClassName,
  hideLabel = false,
  quickFilters = [],
}: {
  label: string;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  emptyLabel?: string;
  allLabel?: string;
  className?: string;
  triggerClassName?: string;
  hideLabel?: boolean;
  quickFilters?: MultiSelectQuickFilter[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const allValues = options.map((option) => option.value);
  const summary =
    selected.length === 0
      ? emptyLabel
      : selected.length === allValues.length
        ? allLabel
        : `${selected.length} sélectionné${selected.length > 1 ? "s" : ""}`;

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) => {
      const haystack = [
        option.label,
        option.description,
        option.badge,
        option.value,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [options, query]);

  function toggle(value: string, checked: boolean) {
    if (checked) {
      onChange([...new Set([...selected, value])]);
      return;
    }
    onChange(selected.filter((item) => item !== value));
  }

  function selectByBadge(badge: string) {
    onChange(
      options
        .filter((option) => option.badge === badge)
        .map((option) => option.value)
    );
  }

  function isQuickFilterActive(badge: string): boolean {
    const matching = options
      .filter((option) => option.badge === badge)
      .map((option) => option.value);
    if (matching.length === 0) return false;
    if (selected.length !== matching.length) return false;
    return matching.every((value) => selected.includes(value));
  }

  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      {!hideLabel ? (
        <span className="text-muted-foreground text-xs font-semibold tracking-[0.06em] uppercase">
          {label}
        </span>
      ) : null}
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery("");
        }}
      >
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className={cn(
                "w-full justify-between font-normal",
                triggerClassName
              )}
            />
          }
        >
          <span className="truncate">
            {hideLabel ? `${label} · ${summary}` : summary}
          </span>
          <ChevronsUpDown data-icon="inline-end" className="opacity-60" />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80 gap-2 p-2">
          <PopoverHeader className="px-1">
            <PopoverTitle>{label}</PopoverTitle>
            <PopoverDescription>
              Sélection multiple - les KPI se recalculent immédiatement.
            </PopoverDescription>
          </PopoverHeader>

          <InputGroup>
            <InputGroupInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Filtrer ${label.toLowerCase()}…`}
              aria-label={`Filtrer ${label}`}
            />
          </InputGroup>

          <div className="flex flex-wrap gap-1 px-0.5">
            <Button
              type="button"
              size="xs"
              variant="ghost"
              onClick={() => onChange(allValues)}
            >
              Tous
            </Button>
            <Button
              type="button"
              size="xs"
              variant="ghost"
              onClick={() => onChange([])}
            >
              Aucun
            </Button>
            {quickFilters.map((filter) => {
              const active = isQuickFilterActive(filter.badge);
              return (
                <Button
                  key={filter.badge}
                  type="button"
                  size="xs"
                  variant={active ? "secondary" : "outline"}
                  onClick={() => selectByBadge(filter.badge)}
                >
                  {filter.label}
                </Button>
              );
            })}
          </div>

          <div className="max-h-64 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <p className="text-muted-foreground px-2 py-3 text-center text-sm">
                Aucun résultat.
              </p>
            ) : (
              <ul className="flex flex-col gap-0.5">
                {filteredOptions.map((option) => {
                  const checked = selected.includes(option.value);
                  const id = `${label}-${option.value}`;
                  return (
                    <li key={option.value}>
                      <label
                        htmlFor={id}
                        className="hover:bg-muted flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5"
                      >
                        <Checkbox
                          id={id}
                          checked={checked}
                          onCheckedChange={(next) =>
                            toggle(option.value, next === true)
                          }
                          className="mt-0.5"
                        />
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span className="truncate text-sm">{option.label}</span>
                          <span className="flex flex-wrap items-center gap-1.5">
                            {option.description ? (
                              <span className="text-muted-foreground font-mono text-xs">
                                {option.description}
                              </span>
                            ) : null}
                            {option.badge ? (
                              <Badge
                                variant="outline"
                                className="h-5 px-1.5 text-[10px] font-medium"
                              >
                                {option.badge}
                              </Badge>
                            ) : null}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
