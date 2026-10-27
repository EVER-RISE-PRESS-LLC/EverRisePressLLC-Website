"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookMarked, BookOpen, Eye, EyeOff, LoaderCircle, PenLine, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim().toLowerCase(), password }) });
      const data = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok) {
        setError(response.status === 429 ? "Too many sign-in attempts. Wait a few minutes, then try again." : data?.error ?? "Could not sign in. Check your email and password, then try again.");
        setLoading(false);
        return;
      }
      router.replace("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Could not connect. Check your internet connection, then try signing in again.");
      setLoading(false);
    }
  }

  return <main className="admin-login">
    <div className="admin-login-intro">
      <Link href="/" className="admin-brand"><span className="admin-brand-mark"><BookMarked className="size-5" aria-hidden="true" /></span><span><strong>EverRise Press</strong><small>Publisher workspace</small></span></Link>
      <h1>Bring your next idea to life.</h1>
      <p>A little space for the work behind the words. Sign in to manage your publishing website.</p>
      <div className="admin-login-benefits" aria-label="Workspace tools">
        <div><PenLine aria-hidden="true" /><p><strong>Write and publish</strong><span>Take articles from first idea to finished story.</span></p></div>
        <div><BookOpen aria-hidden="true" /><p><strong>Care for your catalog</strong><span>Keep books, author profiles, and links current.</span></p></div>
        <div><Users aria-hidden="true" /><p><strong>Understand your readers</strong><span>Review chapter signups and partner activity.</span></p></div>
      </div>
    </div>
    <section className="admin-login-panel" aria-labelledby="admin-sign-in-heading">
      <h2 id="admin-sign-in-heading">Welcome back</h2><p>Sign in with your staff account.</p>
      <form onSubmit={handleSubmit} className="admin-login-form" aria-busy={loading}>
        {error ? <div id="admin-login-error" ref={errorRef} className="admin-form-error" role="alert" tabIndex={-1}>{error}</div> : null}
        <div className="admin-field"><Label htmlFor="admin-email">Email address</Label><Input id="admin-email" name="email" type="email" autoComplete="username" inputMode="email" autoCapitalize="none" spellCheck={false} required disabled={loading} value={email} onChange={event => setEmail(event.target.value)} placeholder="you@everrisepress.com" aria-describedby={error ? "admin-login-error" : undefined} /></div>
        <div className="admin-field"><Label htmlFor="admin-password">Password</Label><div className="admin-password"><Input id="admin-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required disabled={loading} value={password} onChange={event => setPassword(event.target.value)} onKeyUp={event => setCapsLock(event.getModifierState("CapsLock"))} onBlur={() => setCapsLock(false)} aria-describedby={error ? "admin-login-error" : capsLock ? "admin-caps-lock" : undefined} /><button type="button" className="admin-password-toggle" onClick={() => setShowPassword(previous => !previous)} disabled={loading} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>{showPassword ? <EyeOff className="size-[18px]" aria-hidden="true" /> : <Eye className="size-[18px]" aria-hidden="true" />}</button></div>{capsLock ? <p id="admin-caps-lock" className="admin-form-hint" role="status">Caps Lock is on.</p> : null}</div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}{loading ? "Signing in…" : "Sign in to workspace"}</Button>
      </form>
      <div className="admin-login-footer"><p>Need access or help signing in? Ask the person who manages your EverRise Press account.</p><Link href="/" className="admin-login-back"><ArrowLeft className="size-4" aria-hidden="true" />Back to the website</Link></div>
    </section>
  </main>;
}
