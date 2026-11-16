import { HOME_FAQ } from "@/content/siteContent";

/**
 * Visible counterpart of the homepage FAQPage JSON-LD. Both read HOME_FAQ so
 * the structured data always matches what's on the page.
 */
export function HomeFaq() {
  return (
    <section aria-labelledby="home-faq-heading" className="border-t px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-6xl">
        <h2 id="home-faq-heading" className="text-2xl font-semibold tracking-tight">
          Questions people ask
        </h2>
        <dl className="mt-8 grid gap-x-10 gap-y-8 md:grid-cols-2">
          {HOME_FAQ.map(({ question, answer }) => (
            <div key={question}>
              <dt className="font-semibold">{question}</dt>
              <dd className="mt-1.5 leading-relaxed text-muted-foreground">{answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
