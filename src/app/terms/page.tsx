import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="mb-8">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            &larr; Back to home
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground text-sm mb-8">Last updated: March 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using FLtool, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Use of the Service</h2>
            <p>
              FLtool provides tools for freelancers to manage invoices, contracts, clients, and expenses.
              You are responsible for all activity that occurs under your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Electronic Signatures</h2>
            <p>
              Electronic signatures created through FLtool are legally binding under applicable electronic
              signature laws. By signing a document, you agree that your signature is valid and enforceable.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Payments and Subscriptions</h2>
            <p>
              Paid plans are billed on a monthly basis. You may cancel at any time. Refunds are handled
              on a case-by-case basis. We reserve the right to change pricing with 30 days notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Limitation of Liability</h2>
            <p>
              FLtool is provided &quot;as is&quot; without warranties of any kind. We are not liable for
              any indirect, incidental, or consequential damages arising from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Contact</h2>
            <p>
              For questions about these terms, please contact us at support@freelancepro.app.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
