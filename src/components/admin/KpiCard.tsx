import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KpiCard({ label, value, delta, icon: Icon, sublabel }: { label: string; value: string; delta?: { value: number; positiveIsGood?: boolean }; icon: LucideIcon; sublabel?: string }) {
  const good = delta && ((delta.positiveIsGood ?? true) ? delta.value > 0 : delta.value < 0);
  return <Card className="admin-kpi-card"><CardContent>
    <div className="admin-kpi-label"><p>{label}</p><Icon className="size-[18px]" aria-hidden="true" /></div>
    <p className="admin-kpi-value">{value}</p>
    {delta !== undefined || sublabel ? <div className="admin-kpi-note">
      {delta !== undefined ? <span className={cn("admin-kpi-delta", delta.value === 0 ? "text-muted-foreground" : good ? "admin-positive" : "text-destructive")}>
        {delta.value !== 0 ? (delta.value > 0 ? <ArrowUpRight className="size-3.5" aria-hidden="true" /> : <ArrowDownRight className="size-3.5" aria-hidden="true" />) : null}
        {delta.value > 0 ? "+" : ""}{delta.value}%<span className="sr-only"> change</span>
      </span> : null}
      {sublabel ? <span>{sublabel}</span> : delta !== undefined ? <span>vs. previous 30 days</span> : null}
    </div> : null}
  </CardContent></Card>;
}
