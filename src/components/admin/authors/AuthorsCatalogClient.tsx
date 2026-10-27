"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, UserPen, X } from "lucide-react";
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
import { CatalogImage } from "../books/CatalogImage";
import { AuthorRowActions } from "./AuthorRowActions";

export interface CatalogAuthor {
  id: string;
  name: string;
  slug: string;
  title: string | null;
  avatarUrl: string | null;
  bookCount: number;
  articleCount: number;
}
export function AuthorsCatalogClient({
  authors,
  canDelete,
}: {
  authors: CatalogAuthor[];
  canDelete: boolean;
}) {
  const [query, setQuery] = useState("");
  const filtered = authors.filter((author) =>
    `${author.name} ${author.title ?? ""} ${author.slug}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
          <Input
            aria-label="Search authors by name"
            placeholder="Search authors"
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
              aria-label="Clear author search"
            >
              <X className="size-4" />
            </Button>
          ) : null}
        </div>
        <p role="status" className="text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "author" : "authors"}
          {query ? " found" : " in your catalog"}
        </p>
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          icon={UserPen}
          title="No authors match your search"
          message="Try a different name, or clear the search to see every author."
          action={
            <Button
              variant="outline"
              className="min-h-11"
              onClick={() => setQuery("")}
            >
              Clear search
            </Button>
          }
        />
      ) : (
        <>
          <div className="divide-y overflow-hidden rounded-xl border bg-card md:hidden">
            {filtered.map((author) => (
              <div key={author.id} className="flex items-start gap-3 p-4">
                <CatalogImage
                  src={author.avatarUrl}
                  name={author.name}
                  kind="author"
                  className="size-14"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/authors/${author.id}`}
                    className="inline-block py-1 font-semibold underline-offset-4 hover:underline"
                  >
                    {author.name}
                  </Link>
                  {author.title ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {author.title}
                    </p>
                  ) : null}
                  <p className="mt-2 text-sm text-muted-foreground">
                    {author.bookCount}{" "}
                    {author.bookCount === 1 ? "book" : "books"} ·{" "}
                    {author.articleCount}{" "}
                    {author.articleCount === 1 ? "article" : "articles"}
                  </p>
                </div>
                <AuthorRowActions
                  author={author}
                  canDelete={canDelete}
                  bookCount={author.bookCount}
                  articleCount={author.articleCount}
                />
              </div>
            ))}
          </div>
          <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Author</TableHead>
                  <TableHead>Role or introduction</TableHead>
                  <TableHead>Books</TableHead>
                  <TableHead>Articles</TableHead>
                  <TableHead className="w-16">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((author) => (
                  <TableRow key={author.id}>
                    <TableCell className="py-5 pl-5">
                      <div className="flex items-center gap-4">
                        <CatalogImage
                          src={author.avatarUrl}
                          name={author.name}
                          kind="author"
                          className="size-14"
                        />
                        <Link
                          href={`/admin/authors/${author.id}`}
                          className="whitespace-normal font-semibold underline-offset-4 hover:underline"
                        >
                          {author.name}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-sm whitespace-normal text-sm text-muted-foreground">
                      {author.title || "Not set"}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {author.bookCount}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {author.articleCount}
                    </TableCell>
                    <TableCell>
                      <AuthorRowActions
                        author={author}
                        canDelete={canDelete}
                        bookCount={author.bookCount}
                        articleCount={author.articleCount}
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
