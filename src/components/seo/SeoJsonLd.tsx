import { getSeoGraph } from "@/lib/seo/graph";
import type { SeoPageType } from "@/lib/seo/registry";
import JsonLd from "./JsonLd";

/**
 * Registry-driven JSON-LD injector. Renders the assembled knowledge graph
 * for a page type as a single `application/ld+json` script.
 */
export default function SeoJsonLd({
  type,
  data,
}: {
  type: SeoPageType;
  data?: unknown;
}) {
  const graph = getSeoGraph(type, data);
  return <JsonLd data={graph} />;
}
