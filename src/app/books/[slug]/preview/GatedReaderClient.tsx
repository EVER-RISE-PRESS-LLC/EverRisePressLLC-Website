"use client";

import { useState } from "react";
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

  return (
    <GatedReaderModal
      bookSlug={bookSlug}
      bookTitle={bookTitle}
      chapterTitle={chapterTitle}
      chapterBody={chapterBody}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    />
  );
}
