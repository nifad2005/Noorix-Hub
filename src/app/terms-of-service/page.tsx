
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfServicePage() {
  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold font-headline text-primary">Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 prose prose-lg max-w-none dark:prose-invert text-foreground">
            <p>
              These "Terms of Service" constitute a set of legal rules that a user must adhere to when utilizing an online service or platform. It serves as a binding agreement between the user and the service provider.
            </p>
            <p>
              Its primary functions include:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Rules of Use:</strong> Clearly outlines how the platform can be used. For example, what types of content are prohibited from being posted, or what actions are not permitted.
              </li>
              <li>
                <strong>User Responsibilities:</strong> Delineates the user's obligations while using the platform, such as safeguarding account security and providing accurate information.
              </li>
              <li>
                <strong>Platform Rights:</strong> Specifies the rights of the service provider, including the right to modify services, terminate user accounts, or remove content.
              </li>
              <li>
                <strong>Copyright and Intellectual Property:</strong> Explains matters related to the ownership of content available on the platform (e.g., text, images, videos) and the rights concerning content posted by the user.
              </li>
              <li>
                <strong>Dispute Resolution:</strong> Provides guidance on how disputes will be resolved if they arise.
              </li>
              <li>
                <strong>Disclaimer:</strong> States the extent to which the platform will or will not be held responsible for any damages incurred by the user through the use of the platform or service.
              </li>
            </ul>
            <p>
              In essence, these terms serve as a guideline for platform usage, helping users understand what actions are permissible and what are not.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
