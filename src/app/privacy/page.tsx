import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="mb-8">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            &larr; Back to home
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm mb-8">Last updated: March 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Information We Collect</h2>
            <p>
              We collect information you provide when registering an account, including your name, email address,
              company details, and billing information. We also collect usage data to improve our service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. How We Use Your Information</h2>
            <p>
              We use your information to provide and improve our services, process payments, send invoices and
              contracts on your behalf, and communicate with you about your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Data Security</h2>
            <p>
              We take the security of your data seriously. All data is encrypted in transit and at rest.
              We use industry-standard security measures to protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Data Sharing</h2>
            <p>
              We do not sell your personal data to third parties. We may share data with trusted service
              providers (such as payment processors) only as necessary to provide our services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Contact</h2>
            <p>
              If you have questions about this policy, please contact us at support@freelancepro.app.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
