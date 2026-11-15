import { Helmet } from "react-helmet-async";

export const SITE_NAME = "Roast Timer";

/** "My roasts" -> "My roasts · Roast Timer". */
// eslint-disable-next-line react-refresh/only-export-components
export const pageTitle = (page?: string) => (page ? `${page} · ${SITE_NAME}` : SITE_NAME);

interface PageTitleProps {
  /** Page name in sentence case, e.g. "My roasts" */
  title: string;
  description?: string;
  /** Adds robots noindex (private pages) */
  noIndex?: boolean;
}

/** Sets the document title (and optionally description / robots) for a route. */
export function PageTitle({ title, description, noIndex }: PageTitleProps) {
  return (
    <Helmet>
      <title>{pageTitle(title)}</title>
      {description && <meta name="description" content={description} />}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
}
