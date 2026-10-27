export function PageHeader({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return <div className="admin-page-header">
    <div className="min-w-0"><h1>{title}</h1>{description ? <p>{description}</p> : null}</div>
    {children ? <div className="admin-page-actions">{children}</div> : null}
  </div>;
}
