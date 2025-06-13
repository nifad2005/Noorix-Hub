
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center text-center space-y-8 py-12">
        <Image 
          src="https://placehold.co/300x200.png" 
          alt="Abstract technology background" 
          width={300} 
          height={200} 
          className="rounded-lg shadow-xl"
          data-ai-hint="technology abstract" 
        />
        <h1 className="text-5xl font-bold tracking-tight font-headline">
          Welcome to <span className="text-primary">Noorix Hub</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Your central platform for seamless integration and productivity. Explore features, manage your account, and unlock new potentials.
        </p>
        <div className="flex space-x-4">
          <Link href="/login" passHref>
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/#features" passHref>
             <Button size="lg" variant="outline">Learn More</Button>
          </Link>
        </div>
      </div>

      <div id="features" className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12 font-headline">Core Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <Image 
                src="https://placehold.co/600x400.png" 
                alt="User Profile Management" 
                width={600} 
                height={400} 
                className="rounded-t-lg object-cover aspect-video"
                data-ai-hint="user profile" 
              />
              <CardTitle className="mt-4">Profile Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Easily manage your account details, preferences, and security settings in one centralized location.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
               <Image 
                src="https://placehold.co/600x400.png" 
                alt="Secure Authentication" 
                width={600} 
                height={400} 
                className="rounded-t-lg object-cover aspect-video"
                data-ai-hint="secure login" 
              />
              <CardTitle className="mt-4">Secure Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Robust and secure login system, including convenient Google Authentication, to protect your data.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <Image 
                src="https://placehold.co/600x400.png" 
                alt="Intuitive Navigation" 
                width={600} 
                height={400} 
                className="rounded-t-lg object-cover aspect-video"
                data-ai-hint="navigation interface" 
              />
              <CardTitle className="mt-4">Intuitive Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                A clean and simple navbar ensures you can find what you need quickly and efficiently.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
