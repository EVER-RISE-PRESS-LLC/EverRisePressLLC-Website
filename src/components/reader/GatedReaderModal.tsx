"use client";

import { useEffect } from "react";
import TurnstileLeadForm from "@/components/forms/TurnstileLeadForm";
import ChapterViewer from "./ChapterViewer";

interface GatedReaderModalProps {
  bookSlug: string;
  bookTitle: string;
  chapterTitle: string;
  chapterBody: string;
  isOpen: boolean;
  isUnlocked: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GatedReaderModal({
  bookSlug,
  bookTitle,
  chapterTitle,
  chapterBody,
  isOpen,
  isUnlocked,
  onClose,
  onSuccess,
}: GatedReaderModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isUnlocked) onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, isUnlocked, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-charcoal/90 backdrop-blur-sm" />

      <div className="relative bg-cream rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-charcoal/10">
          <div>
            <p className="text-gold font-sans text-xs uppercase tracking-[0.2em] mb-1">
              {isUnlocked ? "Chapter Unlocked" : "The Diagnosis"}
            </p>
            <h2 className="font-heading text-2xl font-bold text-charcoal">
              {bookTitle}
            </h2>
          </div>
          {isUnlocked && (
            <button
              onClick={onClose}
              className="text-charcoal/40 hover:text-charcoal transition-colors text-3xl leading-none p-2"
              aria-label="Close"
            >
              &times;
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isUnlocked ? (
            <ChapterViewer title={chapterTitle} body={chapterBody} />
          ) : (
            <div className="p-8 md:p-12 max-w-xl mx-auto">
              <div className="text-center mb-8">
                <h3 className="font-heading text-3xl font-bold text-charcoal mb-4">
                  Ready to See Your Financial Chart?
                </h3>
                <p className="text-text-body text-lg leading-relaxed">
                  Most people don&apos;t like what they see. That&apos;s the point. Enter your email, 
                  complete the verification, and read Chapter 1 for free.
                </p>
              </div>

              <TurnstileLeadForm bookSlug={bookSlug} onSuccess={onSuccess} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
