import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coffee, ExternalLink } from "lucide-react";

const About = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">About</h1>
        <p className="text-xl text-muted-foreground">
          The story behind this coffee roasting journey
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coffee className="h-6 w-6 text-primary" />
            My Coffee Journey
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            Hi there! I'm toto, a coffee enthusiast who owns a <strong>Gene CBR-101</strong> home coffee roaster. 
            Like many coffee lovers, I wanted to dive deeper into the art and science of coffee roasting 
            to truly understand how different variables affect the final cup.
          </p>
          
          <p className="text-muted-foreground leading-relaxed">
            What started as curiosity quickly became a passion project. I found myself wanting to track 
            my roasting sessions, document different profiles, and learn from each batch. Rather than 
            using spreadsheets or notebooks, I decided to build this small site for fun to digitally 
            track all the roasts I'm making.
          </p>

          <p className="text-muted-foreground leading-relaxed">
            This platform helps me monitor timing, temperature curves, and roast profiles while 
            building a personal database of my coffee roasting experiments. It's been an incredible 
            learning tool that combines my love for coffee with my passion for creating digital solutions.
          </p>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-4">
              Want to learn more about my other projects?
            </p>
            <Button asChild variant="outline">
              <a 
                href="https://bille.dev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                Visit my website
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default About;