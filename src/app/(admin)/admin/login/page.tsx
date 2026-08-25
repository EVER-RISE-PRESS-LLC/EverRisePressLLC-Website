import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME } from "@/lib/auth";
import { AdminThemeProvider } from "@/components/admin/AdminThemeProvider";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign In | EverRise Press",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  if (cookieStore.has(SESSION_COOKIE_NAME)) {
    redirect("/admin/dashboard");
  }

  return (
    <AdminThemeProvider>
      <AdminLoginForm />
    </AdminThemeProvider>
  );
}
