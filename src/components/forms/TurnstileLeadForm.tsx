"use client";

import { useState, useCallback } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { env } from "@/lib/env";
import { trackEvent, identifyUser } from "@/components/providers/PostHogProvider";
import { trackMetaEvent } from "@/components/providers/MetaPixelProvider";
import { gtagEvent } from "@/lib/gtag";
import ReactiveButton from "@/components/ui/ReactiveButton";

interface TurnstileLeadFormProps {
  bookSlug: string;
  partnerSlug?: string | null;
  onSuccess: () => void;
}

export default function TurnstileLeadForm({
  bookSlug,
  partnerSlug,
  onSuccess,
}: TurnstileLeadFormProps) {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const siteKey = env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      if (!email) {
        setError("Enter your email address to continue.");
        return;
      }

      if (!token) {
        setError("Complete the verification first.");
        return;
      }

      setIsSubmitting(true);

      try {
        const response = await fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, bookSlug, turnstileToken: token }),
        });

        const data = (await response.json()) as { error?: string; success?: boolean };

        if (!response.ok) {
          throw new Error(data.error || "Something went wrong.");
        }

        if (data.success) {
          const props = { book_slug: bookSlug, partner_slug: partnerSlug ?? null };
          trackEvent("chapter_unlock_success", props);
          identifyUser(email, props);
          gtagEvent("generate_lead", {
            book_slug: bookSlug,
            partner_slug: partnerSlug ?? undefined,
          });
          trackMetaEvent("Lead", { content_name: bookSlug });
          onSuccess();
        } else {
          throw new Error("Verification failed. Try again.");
        }
      } catch (err) {
        console.error("Lead capture error:", err);
        setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
        setIsSubmitting(false);
      }
    },
    [email, token, bookSlug, partnerSlug, onSuccess]
  );

  if (!siteKey) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 font-semibold">
          Verification service unavailable. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-bold text-charcoal mb-2 uppercase tracking-wider">
          Your Email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          autoComplete="email"
          aria-describedby={error ? "chapter-form-error" : undefined}
          aria-invalid={Boolean(error)}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={isSubmitting}
          className="w-full px-4 py-3 bg-white border-2 border-charcoal/20 rounded focus:border-gold focus:outline-none text-charcoal placeholder:text-text-muted disabled:opacity-50 transition-colors"
          required
        />
      </div>

      <div className="flex justify-center">
        <Turnstile
          siteKey={siteKey}
          onSuccess={setToken}
          onError={() => { setToken(""); setError("Verification failed. Please try again."); }}
          onExpire={() => setToken("")}
          options={{
            theme: "light",
            size: "flexible",
          }}
        />
      </div>

      {error && (
        <p id="chapter-form-error" role="alert" className="text-red-700 text-sm font-semibold text-center">{error}</p>
      )}

      <ReactiveButton
        type="submit"
        disabled={isSubmitting || !token}
        className="w-full"
        aria-busy={isSubmitting}
      >
        {isSubmitting ? "Unlocking..." : "Unlock Chapter 1"}
      </ReactiveButton>

      <p className="text-text-muted text-xs text-center">
        Complete the verification, then unlock your free chapter.
      </p>
    </form>
  );
}
