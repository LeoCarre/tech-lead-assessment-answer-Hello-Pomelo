import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export function PortalPageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <p className="text-muted-foreground text-xs font-semibold tracking-[0.06em] uppercase">
        {eyebrow}
      </p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export function KpiGrid({
  items,
}: {
  items: Array<{ label: string; value: string; hint?: string }>;
}) {
  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold tracking-wide uppercase">
              {item.label}
            </CardDescription>
            <CardTitle className="text-xl tabular-nums">{item.value}</CardTitle>
            {item.hint ? (
              <p className="text-muted-foreground text-xs">{item.hint}</p>
            ) : null}
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

export function DataTableCard({
  title,
  description,
  columns,
  rows,
}: {
  title: string;
  description?: string;
  columns: string[];
  rows: string[][];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={`${title}-${index}`}>
                {row.map((cell, cellIndex) => (
                  <TableCell
                    key={`${index}-${cellIndex}`}
                    className={cn(cellIndex === 0 && "font-medium")}
                  >
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function StatusBadge({
  label,
  tone = "default",
}: {
  label: string;
  tone?: "default" | "ok" | "warn" | "danger";
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        tone === "ok" && "border-transparent bg-emerald-500/15 text-emerald-700",
        tone === "warn" && "border-transparent bg-amber-500/15 text-amber-700",
        tone === "danger" &&
          "border-transparent bg-anomaly-soft text-anomaly"
      )}
    >
      {label}
    </Badge>
  );
}
