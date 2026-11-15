import { Button } from '@/components/ui/button';
import { MessageSquare, ArrowRight } from 'lucide-react';

export const FEEDBACK_URL = 'https://forms.gle/RE2Dt1DF9yRLoZ9m9';

export function FeedbackSection() {

  return (
    <section className="py-16 px-4 bg-muted/20">
      <div className="container max-w-4xl mx-auto text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-primary/10">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-3xl font-bold">Help Us Improve</h2>

        {/* Body Text */}
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your feedback helps us make Coffee Roast Timer better for everyone. 
          We read every submission and use your input to guide future development.
        </p>

        {/* CTA Button */}
        <div className="pt-4">
          <Button
            size="lg"
            className="text-lg"
            asChild
          >
            <a
              href={FEEDBACK_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Share Your Feedback
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
