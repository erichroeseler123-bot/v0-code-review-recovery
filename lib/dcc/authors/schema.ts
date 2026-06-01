/**
 * Authorship schema helpers (Phase 14).
 *
 * Honest-schema rule: every field emitted here must correspond to content that
 * is VISIBLE on the page. We intentionally do NOT emit jobTitle, image,
 * sameAs (social), worksFor with fake employment, awards, or any credential.
 * The `description` we emit is the SAME disclosure string shown on the page.
 *
 * Pure builders. No network calls. Nothing is injected into public pages here —
 * the caller decides where (if anywhere) to render the JSON-LD.
 */

import type { DccAuthor } from "./authorRegistry"

const PUBLISHER_NAME = "Destination Command Center"

/** Absolute-ish url builder. Falls back to the internal profile path. */
function authorUrl(author: DccAuthor, origin?: string): string {
  return origin ? `${origin.replace(/\/$/, "")}${author.profilePath}` : author.profilePath
}

/**
 * ProfilePage + author schema for an author's own page.
 * For an organization desk the mainEntity is an Organization, not a Person,
 * so we never imply a fictional persona is a real human.
 */
export function buildAuthorProfileSchema(author: DccAuthor, origin?: string) {
  const url = authorUrl(author, origin)

  const mainEntity =
    author.type === "organization_desk"
      ? {
          "@type": "Organization",
          name: author.name,
          description: author.disclosure,
          parentOrganization: { "@type": "Organization", name: PUBLISHER_NAME },
        }
      : {
          // Disclosed editorial persona. `description` mirrors the visible disclosure.
          "@type": "Person",
          name: author.name,
          description: author.disclosure,
          url,
        }

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url,
    name: `${author.name} — ${author.desk}`,
    mainEntity,
  }
}

/**
 * The `author` object to embed inside an Article. Matches the visible byline +
 * disclosure only — no credentials, no image, no social profiles.
 */
export function buildArticleAuthorSchema(author: DccAuthor, origin?: string) {
  if (author.type === "organization_desk") {
    return { "@type": "Organization", name: author.name, description: author.disclosure }
  }
  return {
    "@type": "Person",
    name: author.name,
    description: author.disclosure,
    url: authorUrl(author, origin),
  }
}

export type ArticleSchemaInput = {
  title: string
  author: DccAuthor
  /** Publisher brand for this surface (satellite brand or DCC). Visible on the page. */
  publisherName?: string
  url: string
  dateModified?: string
  datePublished?: string
}

/**
 * Article schema with a disclosed author. Only includes fields the caller
 * supplies, so we never emit dates or publishers that aren't real/visible.
 */
export function buildArticleSchema(input: ArticleSchemaInput) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    author: buildArticleAuthorSchema(input.author),
    publisher: { "@type": "Organization", name: input.publisherName ?? PUBLISHER_NAME },
    url: input.url,
  }
  if (input.datePublished) schema.datePublished = input.datePublished
  if (input.dateModified) schema.dateModified = input.dateModified
  return schema
}
