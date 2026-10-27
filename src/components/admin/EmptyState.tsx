import type { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, title, message, action }: { icon: LucideIcon; title: string; message: string; action?: React.ReactNode }) {
  return <div className="admin-empty-state">
    <span className="admin-empty-icon"><Icon className="size-6" aria-hidden="true" /></span>
    <h3>{title}</h3><p>{message}</p>{action ? <div className="admin-empty-action">{action}</div> : null}
  </div>;
}
