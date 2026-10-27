import { Skeleton } from "@/components/ui/skeleton";

export default function AdminWorkspaceLoading() {
  return <div role="status" aria-label="Loading workspace" className="space-y-7">
    <div className="space-y-3"><Skeleton className="h-8 w-64 max-w-full" /><Skeleton className="h-5 w-96 max-w-full" /></div>
    <Skeleton className="h-36 w-full rounded-xl" />
    <div className="grid gap-5 lg:grid-cols-3"><Skeleton className="h-64 rounded-xl lg:col-span-2" /><Skeleton className="h-64 rounded-xl" /></div>
    <span className="sr-only">Your workspace is loading.</span>
  </div>;
}
