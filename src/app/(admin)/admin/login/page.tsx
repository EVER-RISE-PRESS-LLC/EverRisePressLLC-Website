import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCloudflareContext } from "@/lib/cloudflare-context";
import { getCurrentAdminUser } from "@/lib/auth";
import { AdminThemeProvider } from "@/components/admin/AdminThemeProvider";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sign In | EverRise Press", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  const { env } = await getCloudflareContext({ async: true });
  const user = await getCurrentAdminUser(env.DB);
  if (user) redirect("/admin/dashboard");
  return <AdminThemeProvider><AdminLoginForm /></AdminThemeProvider>;
}
