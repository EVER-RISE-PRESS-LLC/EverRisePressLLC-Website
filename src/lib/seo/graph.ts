import { assembleGraph } from "@jdevalk/seo-graph-core";
import { seoIds } from "./ids";
import {
  organizationPiece,
  seoRegistry,
  websitePiece,
  type SeoPageType,
} from "./registry";

/**
 * Assemble the full knowledge graph for one page type.
 *
 * For non-home pages, the Organization and WebSite site-wide entities are
 * prepended as stubs so `publisher` / `isPartOf` references always resolve.
 * The home entry builds those entities itself.
 */
export function getSeoGraph(type: SeoPageType, data?: unknown) {
  const entry = seoRegistry[type];

  const pieces = type === "home" ? [] : [organizationPiece(), websitePiece()];
  pieces.push(...entry.buildPieces(data ?? {}, seoIds));

  return assembleGraph(pieces);
}
