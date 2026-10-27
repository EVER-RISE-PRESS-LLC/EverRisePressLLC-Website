"use client";

import Link from "next/link";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminWorkspaceError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <Card className="mx-auto mt-8 max-w-xl"><CardContent className="flex flex-col items-start gap-5" role="alert">
    <span className="admin-empty-icon mb-0"><TriangleAlert className="size-6" aria-hidden="true" /></span>
    <div><h1 className="text-2xl font-bold">This workspace could not load</h1><p className="mt-3 text-base leading-relaxed text-muted-foreground">A connection or service issue may be getting in the way. Try loading it again. If the problem continues, return to the overview and open your work from there.</p></div>
    <div className="flex flex-wrap gap-3"><Button type="button" onClick={reset}><RefreshCw className="size-4" aria-hidden="true" />Try again</Button><Button asChild variant="outline"><Link href="/admin/dashboard">Go to overview</Link></Button></div>
  </CardContent></Card>;
}
