"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, ListFilter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type SortDirection = "asc" | "desc";

export type ColumnSortState = {
  key: string;
  dir: SortDirection;
} | null;

export type ColumnSortOption = {
  key: string;
  dir: SortDirection;
  label: string;
};

export function compareSortValues(
  a: string | number,
  b: string | number,
  dir: SortDirection
): number {
  const mul = dir === "asc" ? 1 : -1;
  if (typeof a === "number" && typeof b === "number") {
    return (a - b) * mul;
  }
  return (
    String(a).localeCompare(String(b), "fr", {
      numeric: true,
      sensitivity: "base",
    }) * mul
  );
}

export function ColumnControl({
  label,
  sortKey,
  activeSortKey,
  sortDir,
  onSort,
  sortOptions,
  filterOptions,
  selectedFilters,
  onFilterChange,
  className,
}: {
  label: string;
  sortKey: string;
  activeSortKey: string | null;
  sortDir: SortDirection | null;
  onSort: (next: ColumnSortState) => void;
  /** When set, replaces the default Croissant / Décroissant actions. */
  sortOptions?: ColumnSortOption[];
  filterOptions?: string[];
  selectedFilters?: string[];
  onFilterChange?: (values: string[]) => void;
  className?: string;
}) {
  const modes: ColumnSortOption[] = sortOptions ?? [
    { key: sortKey, dir: "asc", label: "Croissant" },
    { key: sortKey, dir: "desc", label: "Décroissant" },
  ];
  const relatedKeys = new Set(modes.map((mode) => mode.key));
  const isColumnSorted =
    activeSortKey !== null && relatedKeys.has(activeSortKey);
  const hasFilterOptions = (filterOptions?.length ?? 0) > 0;
  const selected = selectedFilters ?? [];
  const filterActive =
    hasFilterOptions &&
    selected.length > 0 &&
    selected.length < (filterOptions?.length ?? 0);

  function toggleFilter(value: string, checked: boolean) {
    if (!onFilterChange || !filterOptions) return;
    if (checked) {
      onFilterChange([...new Set([...selected, value])]);
      return;
    }
    onFilterChange(selected.filter((item) => item !== value));
  }

  function toggleSortOption(key: string, dir: SortDirection) {
    if (activeSortKey === key && sortDir === dir) {
      onSort(null);
      return;
    }
    onSort({ key, dir });
  }

  return (
    <TableHead className={cn("whitespace-nowrap", className)}>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className={cn(
                "text-muted-foreground hover:text-foreground -ml-1 h-7 gap-1 px-1.5 font-medium",
                (isColumnSorted || filterActive) && "text-foreground"
              )}
            />
          }
        >
          <span>{label}</span>
          {isColumnSorted && sortDir === "asc" ? (
            <ArrowUp className="size-3.5 opacity-80" />
          ) : isColumnSorted && sortDir === "desc" ? (
            <ArrowDown className="size-3.5 opacity-80" />
          ) : hasFilterOptions ? (
            <ListFilter
              className={cn("size-3.5 opacity-50", filterActive && "opacity-90")}
            />
          ) : (
            <ArrowUpDown className="size-3.5 opacity-40" />
          )}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56 gap-2 p-2">
          <PopoverHeader className="px-1">
            <PopoverTitle className="text-sm">{label}</PopoverTitle>
            <PopoverDescription>
              Trier ou filtrer cette colonne. Recliquer un tri actif pour
              l’annuler.
            </PopoverDescription>
          </PopoverHeader>
          <div className="flex flex-col gap-0.5">
            {modes.map((mode) => {
              const active =
                activeSortKey === mode.key && sortDir === mode.dir;
              return (
                <Button
                  key={`${mode.key}-${mode.dir}-${mode.label}`}
                  type="button"
                  size="xs"
                  variant={active ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => toggleSortOption(mode.key, mode.dir)}
                >
                  {mode.dir === "asc" ? (
                    <ArrowUp data-icon="inline-start" />
                  ) : (
                    <ArrowDown data-icon="inline-start" />
                  )}
                  {mode.label}
                </Button>
              );
            })}
          </div>
          {hasFilterOptions && onFilterChange && filterOptions ? (
            <div className="border-border mt-1 border-t pt-2">
              <div className="mb-1 flex items-center justify-between px-1">
                <span className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                  Valeurs
                </span>
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  className="h-6 px-1.5 text-[11px]"
                  onClick={() => onFilterChange(filterOptions)}
                >
                  Toutes
                </Button>
              </div>
              <ul className="flex max-h-48 flex-col gap-0.5 overflow-y-auto">
                {filterOptions.map((option) => {
                  const checked =
                    selected.length === 0 || selected.includes(option);
                  const id = `${sortKey}-filter-${option}`;
                  return (
                    <li key={option}>
                      <label
                        htmlFor={id}
                        className="hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5"
                      >
                        <Checkbox
                          id={id}
                          checked={checked}
                          onCheckedChange={(next) => {
                            const currentlyAll =
                              selected.length === 0 ||
                              selected.length === filterOptions.length;
                            if (currentlyAll && next !== true) {
                              onFilterChange(
                                filterOptions.filter((item) => item !== option)
                              );
                              return;
                            }
                            toggleFilter(option, next === true);
                          }}
                        />
                        <span className="truncate text-xs">{option}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </PopoverContent>
      </Popover>
    </TableHead>
  );
}
