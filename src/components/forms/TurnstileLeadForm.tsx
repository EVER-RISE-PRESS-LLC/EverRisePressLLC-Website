"use client";

import { useState, useCallback } from "react";
import { Turnstile } from "@marsidev/react-turnstile";

interface TurnstileLeadFormProps {
  bookSlug: string;
  onSuccess: () => void;
}

export default function TurnstileLeadForm({ bookSlug, onSuccess }: TurnstileLeadFormProps) {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      if (!email) {
        setError("You need an email. That's how this works.");
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

        const data = (await response.json()) as { error?: string };

        if (!response.ok) {
          throw new Error(data.error || "Something went wrong.");
        }

        onSuccess();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
        setIsSubmitting(false);
      }
    },
    [email, token, bookSlug, onSuccess]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-bold text-charcoal mb-2 uppercase tracking-wider">
          Your Email
        </label>
        <input
          id="email"
          type="email"
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
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
          onSuccess={setToken}
          options={{
            theme: "light",
            size: "flexible",
          }}
        />
      </div>

      {error && (
        <p className="text-red-600 text-sm font-semibold text-center">{error}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !token}
        className="w-full px-8 py-4 bg-gold text-charcoal font-sans font-bold text-sm uppercase tracking-wider rounded hover:bg-gold-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Unlocking..." : "Unlock Chapter 1"}
      </button>

      <p className="text-text-muted text-xs text-center">
        No spam. No bullshit. Just the diagnosis.
      </p>
    </form>
  );
}
