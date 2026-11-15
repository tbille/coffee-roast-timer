import { HOME_FAQ } from '@/content/siteContent';

/**
 * Visible counterpart of the homepage FAQPage JSON-LD. Both read HOME_FAQ so
 * the structured data always matches what's on the page.
 */
export function HomeFaq() {
  return (
    <section className="container mx-auto max-w-6xl px-4 py-12" aria-labelledby="home-faq-heading">
      <h2 id="home-faq-heading" className="text-2xl font-bold mb-6">
        Frequently Asked Questions
      </h2>
      <dl className="grid gap-6 md:grid-cols-2">
        {HOME_FAQ.map(({ question, answer }) => (
          <div key={question}>
            <dt className="font-semibold mb-1">{question}</dt>
            <dd className="text-sm text-muted-foreground leading-relaxed">{answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
