
"use client";

import { useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, Rocket, Users, Target, FlaskConical, Cpu, BookOpen, Atom, Languages } from "lucide-react";

const banglaContent = {
  pageTitle: "আমাদের সম্পর্কে",
  pageSubtitle: "নোওরিক্স-এ আপনাকে স্বাগতম, যেখানে কৌতূহল এবং উদ্ভাবন প্রযুক্তির ভবিষ্যৎ তৈরি করে।",
  welcomeTitle: "নোওরিক্স-এ স্বাগতম",
  welcomeParagraph1: "আমরা একটি পরীক্ষামূলক টেক স্টার্টআপ যা X&I — Experimentation & Innovation (পরীক্ষা-নিরীক্ষা ও উদ্ভাবন) এর মূলনীতিতে প্রতিষ্ঠিত। আমাদের দৃঢ় বিশ্বাস হলো, সত্যিকারের যুগান্তকারী সাফল্য আসে বিশাল বিনিয়োগ বা প্রচলিত পদ্ধতির মাধ্যমে নয়, বরং আসে ছোট, অদ্ভুত এবং পুনরাবৃত্তিমূলক পরীক্ষা-নিরীক্ষার মাধ্যমেই। এই দর্শনের কেন্দ্রবিন্দুতে রয়েছে আমাদের ট্যাগলাইন:",
  tagline: "\"Build Small. Build Weird.\"",
  taglineParagraph: "এটি কেবল একটি স্লোগান নয়; এটি আমাদের কাজের প্রতিটি পদক্ষেপের অনুপ্রেরণা। এটি আমাদের শেখায় কীভাবে ক্ষুদ্রতম স্ফুলিঙ্গ থেকেই বৃহত্তম বিপ্লবের জন্ম হতে পারে।",
  visionTitle: "আমাদের ভিশন",
  visionContent: "AI এবং উদীয়মান প্রযুক্তিতে বিশ্বনেতা হওয়া, ক্ষুদ্র, সাহসী এবং প্রভাবশালী টুল তৈরির মাধ্যমে উদ্ভাবনকে অনুপ্রাণিত করা এবং পরিবর্তন আনা।",
  missionTitle: "আমাদের মিশন",
  missionContent: "সহজ, উদ্ভাবনী পরীক্ষা-নিরীক্ষা তৈরি করা যা উচ্চ-প্রভাবশালী সমাধানে রূপান্তরিত হবে, এবং বিশ্বজুড়ে স্টার্টআপ, ডেভেলপার এবং সংস্থাগুলোকে সেবা দেবে।",
  philosophyTitle: "আমাদের কোর ফিলোসফি",
  philosophyQuote: "\"কৌতূহল দিয়ে শুরু করুন, সরলতার সাথে তৈরি করুন, প্রভাবের সাথে বিকশিত হন।\"",
  philosophyParagraph: "আমরা কৌতূহল দিয়ে শুরু করি, সরলতার সাথে তৈরি করি এবং প্রভাবের সাথে বিকশিত হই। নোওরিক্স অপ্রত্যাশিত পরীক্ষা-নিরীক্ষার শক্তিকে আলিঙ্গন করে। আমরা বড় কিছু তৈরির পরিবর্তে সাহসী কিন্তু ক্ষুদ্র জিনিস তৈরি করি – দ্রুত প্রোটোটাইপ, মজার টুলস, মাইক্রো-এআই ইউটিলিটি – যার প্রতিটিই পূর্ণাঙ্গ সিস্টেমে পরিণত হওয়ার সম্ভাবনা রাখে।",
  valuesTitle: "আমাদের মূল মূল্যবোধ",
  valuesList: [
    { strong: "ব্যাপকতা নয়, সরলতা:", text: "জটিল, বৃহৎ-স্কেলের স্থাপন পদ্ধতির চেয়ে সহজ সমাধানের অগ্রাধিকার।" },
    { strong: "কৌতূহল-চালিত নকশা:", text: "অন্বেষণ ও আবিষ্কারের আকাঙ্ক্ষা দ্বারা চালিত হয়ে নতুন কিছু তৈরি করা।" },
    { strong: "দ্রুত পুনরাবৃত্তি, ধীর পরিপূর্ণতা:", text: "দ্রুত পরীক্ষার মাধ্যমে দ্রুত শেখা এবং ধীরে ধীরে পরিমার্জন করা।" },
    { strong: "সম্প্রদায়-কেন্দ্রিক উন্নয়ন:", text: "সহযোগিতামূলকভাবে কাজ করা এবং সম্প্রদায়ের সাথে জড়িত থাকা।" },
    { strong: "পরীক্ষার মাধ্যমে উদ্ভাবন:", text: "অবিরাম পরীক্ষা-নিরীক্ষার মাধ্যমে নতুন সমাধান আবিষ্কার করা।" },
  ],
  focusAreasTitle: "আমাদের প্রধান ফোকাস এরিয়াগুলো",
  focusAreas: [
    { Icon: Cpu, label: "AI ও অটোমেশন" },
    { Icon: Rocket, label: "মাইক্রো SaaS টুলস" },
    { Icon: Target, label: "API-ভিত্তিক সেবা" },
    { Icon: BookOpen, label: "এডটেক ইউটিলিটিস" },
    { Icon: Atom, label: "কোয়ান্টাম কম্পিউটিং সিমুলেশন (মৌলিক স্তর)" },
  ],
  mindsetTitle: "নোওরিক্স শুধু একটি স্টার্টআপ নয় – এটি একটি মাইন্ডসেট।",
  mindsetParagraph: "এটি সাহস করে তৈরি করা, পরীক্ষা করা, ব্যর্থ হওয়া, শেখা এবং পুনরাবৃত্তি করার বিষয়। লক্ষ্য দ্রুত বড় হওয়া নয়, বরং প্রতিটি ছোট ছোট কাজের মাধ্যমে গভীরতা অনুসন্ধান করা।",
  founderInfo: {
    founder: "প্রতিষ্ঠাতা: মোঃ নিফাদ উজ জামান (নিফাদ)",
    foundingDate: "প্রতিষ্ঠার তারিখ: মে ২০২৫",
    headquarters: "সদর দফতর: মাদিলা হাট, ফুলবাড়ি, দিনাজপুর, বাংলাদেশ (রিমোট-ফার্স্ট)",
  },
  invitation: "আমরা আপনাকে আমাদের উদ্ভাবনের যাত্রায় যোগ দেওয়ার জন্য আমন্ত্রণ জানাচ্ছি। নোওরিক্স আপনার উদ্ভাবনের স্ফুলিঙ্গ হোক।"
};

const englishContent = {
  pageTitle: "About NOORIX",
  pageSubtitle: "Where curiosity and innovation shape the future of technology.",
  welcomeTitle: "Welcome to NOORIX",
  welcomeParagraph1: "We are an experimental tech startup founded on the principle of X&I — Experimentation & Innovation. We firmly believe that true breakthroughs don't come from massive investments or conventional methods, but rather from small, weird, and iterative experiments. At the core of this philosophy lies our tagline:",
  tagline: "\"Build Small. Build Weird.\"",
  taglineParagraph: "This is not just a slogan; it's the inspiration behind every step we take. It teaches us how the tiniest spark can ignite the greatest revolutions.",
  visionTitle: "Our Vision",
  visionContent: "To become a global leader in AI and emerging tech by crafting tiny, bold, and impactful tools that inspire innovation and drive change.",
  missionTitle: "Our Mission",
  missionContent: "To create simple, innovative experiments that evolve into high-impact solutions, serving startups, developers, and organizations around the world.",
  philosophyTitle: "Our Core Philosophy",
  philosophyQuote: "\"Start with curiosity, build with simplicity, evolve with impact.\"",
  philosophyParagraph: "We start with curiosity, build with simplicity, and evolve with impact. NOORIX embraces the unpredictable power of experimentation. Rather than building big, we build boldly small — quick prototypes, fun tools, micro-AI utilities — each with the potential to grow into full-fledged systems.",
  valuesTitle: "Our Key Values",
  valuesList: [
    { strong: "Simplicity over scale:", text: "Prioritizing straightforward solutions over complex, large-scale deployments." },
    { strong: "Curiosity-driven design:", text: "Creating new things fueled by a desire to explore and discover." },
    { strong: "Fast iteration, slow perfection:", text: "Learning quickly through rapid testing and refining gradually." },
    { strong: "Community-focused development:", text: "Working collaboratively and engaging with the community." },
    { strong: "Innovation through experimentation:", text: "Discovering new solutions by continuously experimenting." },
  ],
  focusAreasTitle: "Our Main Focus Areas",
  focusAreas: [
      { Icon: Cpu, label: "AI & Automation" },
      { Icon: Rocket, label: "Micro SaaS Tools" },
      { Icon: Target, label: "API-based Services" },
      { Icon: BookOpen, label: "EdTech Utilities" },
      { Icon: Atom, label: "Quantum Computing Simulations (basic-level)" },
  ],
  mindsetTitle: "NOORIX is more than just a startup – it's a mindset.",
  mindsetParagraph: "It's about daring to create, test, fail, learn, and repeat. The goal isn't to get big fast, but to explore deeply, one small build at a time.",
  founderInfo: {
    founder: "Founder: Md Nifad Uzzaman (Nifad)",
    foundingDate: "Founding Date: May 2025",
    headquarters: "Headquarters: Madila Hat, Fulbari, Dinajpur, Bangladesh (Remote-first)",
  },
  invitation: "We invite you to join us on our journey of innovation. Let NOORIX be your spark of innovation."
};

export default function AboutUsPage() {
  const [selectedLang, setSelectedLang] = useState<'en' | 'bn'>('en');
  const content = selectedLang === 'en' ? englishContent : banglaContent;

  return (
    <PageWrapper>
      <div className="mb-8 flex justify-center">
        <Tabs value={selectedLang} onValueChange={(value) => setSelectedLang(value as 'en' | 'bn')} className="w-auto">
          <TabsList>
            <TabsTrigger value="en" className="flex items-center gap-2 px-4 py-2">
              <Languages className="h-5 w-5" /> English
            </TabsTrigger>
            <TabsTrigger value="bn" className="flex items-center gap-2 px-4 py-2">
              <Languages className="h-5 w-5" /> বাংলা
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-12">
        <header className="text-center py-8">
          <h1 className="text-5xl font-bold tracking-tight font-headline text-primary">
            {content.pageTitle}
          </h1>
          <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
            {content.pageSubtitle}
          </p>
        </header>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center">
              <Lightbulb className="mr-3 h-7 w-7 text-primary" />
              {content.welcomeTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-lg leading-relaxed">
            <p>
              {content.welcomeParagraph1}
            </p>
            <blockquote className="border-l-4 border-primary pl-6 py-2 my-6 bg-muted/50 rounded-r-md">
              <p className="text-2xl font-semibold italic text-accent">
                {content.tagline}
              </p>
            </blockquote>
            <p>
              {content.taglineParagraph}
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center">
                <Rocket className="mr-2 h-6 w-6 text-primary" />
                {content.visionTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-base text-muted-foreground">
              {content.visionContent}
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-headline flex items-center">
                <Target className="mr-2 h-6 w-6 text-primary" />
                {content.missionTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-base text-muted-foreground">
              {content.missionContent}
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center">
              <FlaskConical className="mr-3 h-7 w-7 text-primary" />
              {content.philosophyTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-lg leading-relaxed">
            <p className="text-xl font-semibold text-accent italic">
              {content.philosophyQuote}
            </p>
            <p>
              {content.philosophyParagraph}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center">
              <Users className="mr-3 h-7 w-7 text-primary" />
              {content.valuesTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-3 text-lg text-muted-foreground">
              {content.valuesList.map((value, index) => (
                <li key={index}><strong className="text-foreground">{value.strong}</strong> {value.text}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center">
                <Cpu className="mr-3 h-7 w-7 text-primary" />
                {content.focusAreasTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-center">
                {content.focusAreas.map(area => (
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
                {content.mindsetTitle}
            </p>
             <p className="text-xl text-muted-foreground">
                {content.mindsetParagraph}
            </p>
        </section>

        <Separator />

        <section className="py-8 text-center space-y-2">
          <h3 className="text-xl font-semibold font-headline"><span className="text-primary">{content.founderInfo.founder}</span></h3>
          <p className="text-md text-muted-foreground">{content.founderInfo.foundingDate}</p>
          <p className="text-md text-muted-foreground">{content.founderInfo.headquarters}</p>
        </section>

        <section className="text-center py-8">
          <p className="text-xl text-muted-foreground">
            {content.invitation}
          </p>
        </section>
      </div>
    </PageWrapper>
  );
}

    