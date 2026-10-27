"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/admin/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CatalogImage } from "./CatalogImage";
import { BookRowActions } from "./BookRowActions";
import { formatDate } from "@/lib/admin/format";

export interface CatalogBook {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  coverImageUrl: string;
  authorName: string;
  publishedAt: string | null;
  updatedAt: string;
  formatCount: number;
  hasHistory: number;
}
export function BooksCatalogClient({
  books,
  canDelete,
}: {
  books: CatalogBook[];
  canDelete: boolean;
}) {
  const [query, setQuery] = useState("");
  const filtered = books.filter((book) =>
    `${book.title} ${book.subtitle ?? ""} ${book.authorName} ${book.slug}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
          <Input
            aria-label="Search books by title or author"
            placeholder="Search by book title or author"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-h-11 pl-9 pr-11"
          />
          {query ? (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 size-11"
              onClick={() => setQuery("")}
              aria-label="Clear book search"
            >
              <X className="size-4" />
            </Button>
          ) : null}
        </div>
        <p role="status" className="text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "book" : "books"}
          {query ? " found" : " in your catalog"}
        </p>
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No books match your search"
          message="Try another title or author name, or clear the search to see every book."
          action={
            <Button
              variant="outline"
              onClick={() => setQuery("")}
              className="min-h-11"
            >
              Clear search
            </Button>
          }
        />
      ) : (
        <>
          <div className="divide-y overflow-hidden rounded-xl border bg-card md:hidden">
            {filtered.map((book) => (
              <div key={book.id} className="flex items-start gap-4 p-4">
                <CatalogImage
                  src={book.coverImageUrl}
                  name={book.title}
                  className="h-24 w-16"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/books/${book.id}`}
                    className="inline-block py-1 font-semibold leading-snug underline-offset-4 hover:underline"
                  >
                    {book.title}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {book.authorName}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {book.formatCount} retailer{" "}
                    {book.formatCount === 1 ? "link" : "links"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Updated {formatDate(book.updatedAt)}
                  </p>
                </div>
                <BookRowActions
                  book={book}
                  canDelete={canDelete}
                  hasHistory={Boolean(book.hasHistory)}
                />
              </div>
            ))}
          </div>
          <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Book</TableHead>
                  <TableHead>Retailer links</TableHead>
                  <TableHead>Publication date</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-16">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell className="max-w-md py-4 pl-5">
                      <div className="flex items-center gap-4">
                        <CatalogImage
                          src={book.coverImageUrl}
                          name={book.title}
                          className="h-20 w-14"
                        />
                        <div className="min-w-0 whitespace-normal">
                          <Link
                            href={`/admin/books/${book.id}`}
                            className="font-semibold underline-offset-4 hover:underline"
                          >
                            {book.title}
                          </Link>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {book.authorName}
                          </p>
                          {book.subtitle ? (
                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                              {book.subtitle}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {book.formatCount}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {book.publishedAt
                        ? formatDate(book.publishedAt)
                        : "Not set"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(book.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <BookRowActions
                        book={book}
                        canDelete={canDelete}
                        hasHistory={Boolean(book.hasHistory)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </>
  );
}
