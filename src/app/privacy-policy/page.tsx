
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold font-headline text-primary">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 prose prose-lg max-w-none dark:prose-invert text-foreground">
            <p>
              The "Privacy Policy" is a legal document that explains how an online service collects, uses, stores, and protects users' personal information.
            </p>
            <p>
              Its primary functions include:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Information Collection:</strong> Specifies the types of personal information collected (e.g., name, email address, IP address, usage patterns, cookie data).
              </li>
              <li>
                <strong>Purpose of Information Use:</strong> Explains the purposes for which the collected information will be used, such as improving services, personalizing user experience, displaying advertisements, or ensuring security.
              </li>
              <li>
                <strong>Information Sharing:</strong> Informs users with whom (e.g., third parties, advertisers) their information may be shared and under what circumstances.
              </li>
              <li>
                <strong>Data Storage and Security:</strong> Describes how long user information will be retained and the security measures implemented to protect that data.
              </li>
              <li>
                <strong>User Rights:</strong> Clearly outlines the rights users have regarding their personal information (e.g., the right to access, rectify, or request deletion of their data).
              </li>
              <li>
                <strong>Cookies and Tracking Technology:</strong> Provides information about the use and functionality of cookies and other tracking technologies employed on the website.
              </li>
            </ul>
            <p>
              The Privacy Policy helps users be aware of their personal data practices and assists in building their trust. It is crucial for compliance with data protection laws (e.g., GDPR, CCPA).
            </p>
            <p>
              Together, these two documents contribute to fostering a transparent and secure online environment.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
