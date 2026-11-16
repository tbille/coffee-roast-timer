import { createPortal } from "react-dom";

/**
 * Emits a JSON-LD block in <head>. react-helmet-async on React 19 renders
 * <script> children in place (only title/meta/link are hoisted), which left the
 * structured data inside <main>; a portal puts it where crawlers expect it.
 */
export function JsonLd({ data }: { data: unknown }) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(data) }} />,
    document.head,
  );
}

/** Escape `<` so a string value can never close the script element early. */
function safeJson(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
