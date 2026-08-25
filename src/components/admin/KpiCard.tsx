import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  delta,
  icon: Icon,
  sublabel,
}: {
  label: string;
  value: string;
  delta?: { value: number; positiveIsGood?: boolean };
  icon: LucideIcon;
  sublabel?: string;
}) {
  const deltaColor =
    delta === undefined
      ? "text-muted-foreground"
      : delta.value === 0
        ? "text-muted-foreground"
        : (delta.positiveIsGood ?? true)
          ? delta.value > 0
            ? "text-emerald-500"
            : "text-destructive"
          : delta.value > 0
            ? "text-destructive"
            : "text-emerald-500";

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <span className="flex size-8 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Icon className="size-4" />
          </span>
        </div>
        <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums">{value}</p>
        <div className="mt-1 flex items-center gap-2 text-xs">
          {delta !== undefined ? (
            <span className={cn("font-semibold tabular-nums", deltaColor)}>
              {delta.value > 0 ? "+" : ""}
              {delta.value}%
            </span>
          ) : null}
          <span className="text-muted-foreground">
            {sublabel ?? "vs previous 30 days"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
