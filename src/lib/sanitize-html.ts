import DOMPurify from "dompurify";

// Allowlist matches exactly what the rich text editor's toolbar can produce
// (rich-text-editor.tsx): bold/italic/underline/strike, headings, lists,
// links, images, blockquotes. Used both before a product's DescriptionHtml
// is saved and again before it's rendered with dangerouslySetInnerHTML, so
// stored markup is never trusted just because it came from an admin session.
const ALLOWED_TAGS = [
  "p",
  "br",
  "b",
  "strong",
  "i",
  "em",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "h2",
  "h3",
  "blockquote",
];

const ALLOWED_ATTR = ["href", "target", "rel", "src", "alt"];

export function sanitizeDescriptionHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Never allow javascript:/data: hrefs on links (images still need data:
    // blocked too since we only ever insert uploaded-file URLs, not base64).
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|\/)/i,
  });
}
