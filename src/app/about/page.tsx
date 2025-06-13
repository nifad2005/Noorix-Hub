
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Lightbulb, Rocket, Users, Target, FlaskConical, Cpu, BookOpen, Atom } from "lucide-react";

export default function AboutUsPage() {
  return (
    <PageWrapper>
      <div className="space-y-12">
        <header className="text-center py-8">
          <h1 className="text-5xl font-bold tracking-tight font-headline text-primary">
            About NOORIX
          </h1>
          <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
            Where curiosity and innovation shape the future of technology.
          </p>
        </header>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center">
              <Lightbulb className="mr-3 h-7 w-7 text-primary" />
              Welcome to NOORIX
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-lg leading-relaxed">
            <p>
              We are an experimental tech startup founded on the principle of <strong className="text-primary">X&I — Experimentation & Innovation</strong>.
              We firmly believe that true breakthroughs don't come from massive investments or conventional methods,
              but rather from small, weird, and iterative experiments. At the core of this philosophy lies our tagline:
            </p>
            <blockquote className="border-l-4 border-primary pl-6 py-2 my-6 bg-muted/50 rounded-r-md">
              <p className="text-2xl font-semibold italic text-accent">
                "Build Small. Build Weird."
              </p>
            </blockquote>
            <p>
              This is not just a slogan; it's the inspiration behind every step we take. It teaches us how the tiniest spark can ignite the greatest revolutions.
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center">
                <Rocket className="mr-2 h-6 w-6 text-primary" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent className="text-base text-muted-foreground">
              To become a global leader in AI and emerging tech by crafting tiny, bold, and impactful tools that inspire innovation and drive change.
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center">
                <Target className="mr-2 h-6 w-6 text-primary" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="text-base text-muted-foreground">
              To create simple, innovative experiments that evolve into high-impact solutions, serving startups, developers, and organizations around the world.
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center">
              <FlaskConical className="mr-3 h-7 w-7 text-primary" />
              Our Core Philosophy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-lg leading-relaxed">
            <p className="text-xl font-semibold text-accent italic">
              "Start with curiosity, build with simplicity, evolve with impact."
            </p>
            <p>
              We start with curiosity, build with simplicity, and evolve with impact. NOORIX embraces the unpredictable power of experimentation.
              Rather than building big, we build boldly small — quick prototypes, fun tools, micro-AI utilities — each with the potential to grow into full-fledged systems.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center">
              <Users className="mr-3 h-7 w-7 text-primary" />
              Our Key Values
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-3 text-lg text-muted-foreground">
              <li><strong className="text-foreground">Simplicity over scale:</strong> Prioritizing straightforward solutions over complex, large-scale deployments.</li>
              <li><strong className="text-foreground">Curiosity-driven design:</strong> Creating new things fueled by a desire to explore and discover.</li>
              <li><strong className="text-foreground">Fast iteration, slow perfection:</strong> Learning quickly through rapid testing and refining gradually.</li>
              <li><strong className="text-foreground">Community-focused development:</strong> Working collaboratively and engaging with the community.</li>
              <li><strong className="text-foreground">Innovation through experimentation:</strong> Discovering new solutions by continuously experimenting.</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center">
                <Cpu className="mr-3 h-7 w-7 text-primary" />
                Our Main Focus Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-center">
                {[
                    { Icon: Cpu, label: "AI & Automation" },
                    { Icon: Rocket, label: "Micro SaaS Tools" },
                    { Icon: Target, label: "API-based Services" },
                    { Icon: BookOpen, label: "EdTech Utilities" },
                    { Icon: Atom, label: "Quantum Computing Simulations (basic-level)" },
                ].map(area => (
                    <div key={area.label} className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow">
                        <area.Icon className="h-8 w-8 text-primary mx-auto mb-2" />
                        <p className="text-md font-medium">{area.label}</p>
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <section className="text-center space-y-4 py-8">
            <p className="text-xl text-muted-foreground">
                NOORIX is more than just a startup – it's a mindset. It's about daring to create, test, fail, learn, and repeat.
                The goal isn't to get big fast, but to explore deeply, one small build at a time.
            </p>
        </section>

        <Separator />

        <section className="py-8 text-center space-y-2">
          <h3 className="text-xl font-semibold font-headline">Founder: <span className="text-primary">Md Nifad Uzzaman (Nifad)</span></h3>
          <p className="text-md text-muted-foreground">Founding Date: May 2025</p>
          <p className="text-md text-muted-foreground">Headquarters: Madila Hat, Fulbari, Dinajpur, Bangladesh (Remote-first)</p>
        </section>

        <section className="text-center py-8">
          <p className="text-xl text-muted-foreground">
            We invite you to join us on our journey of innovation. Let NOORIX be your spark of innovation.
          </p>
        </section>
      </div>
    </PageWrapper>
  );
}
