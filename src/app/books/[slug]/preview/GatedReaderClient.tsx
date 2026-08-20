"use client";

import { useState, useEffect } from "react";
import GatedReaderModal from "@/components/reader/GatedReaderModal";

interface GatedReaderClientProps {
  bookSlug: string;
  bookTitle: string;
  chapterTitle: string;
  chapterBody: string;
  authorName: string;
  authorSlug: string;
}

export default function GatedReaderClient({
  bookSlug,
  bookTitle,
  chapterTitle,
  chapterBody,
}: GatedReaderClientProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const hasAccess = document.cookie.includes("chapter_access");
    if (hasAccess) {
      setIsUnlocked(true);
    }
  }, []);

  const handleSuccess = () => {
    setIsUnlocked(true);
  };

  return (
    <GatedReaderModal
      bookSlug={bookSlug}
      bookTitle={bookTitle}
      chapterTitle={chapterTitle}
      chapterBody={chapterBody}
      isOpen={isOpen}
      isUnlocked={isUnlocked}
      onClose={() => setIsOpen(false)}
      onSuccess={handleSuccess}
    />
  );
}
