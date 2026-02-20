import Link from 'next/link';
import { FileText } from 'lucide-react';

const MTN_YELLOW = '#FFCB05';
const AIRTEL_RED = '#E40000';

export const metadata = {
  title: 'Privacy Policy — MOAir',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex flex-shrink-0">
              <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: MTN_YELLOW }}>
                <FileText className="w-3 h-3" style={{ color: '#1a1a1a' }} />
              </div>
              <div className="flex-1" style={{ backgroundColor: AIRTEL_RED }} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">MOAir</span>
          </Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">← Back to Home</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-16">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Legal</p>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3">Privacy Policy</h1>
          <p className="text-slate-500 text-sm">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Overview</h2>
            <p>
              MOAir (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your privacy. This policy explains
              what information we collect, how we use it, and your rights regarding that information when
              you use our PDF-to-CSV conversion service at moair.app.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Information We Collect</h2>
            <h3 className="font-semibold text-slate-800 mb-2">PDF Files You Upload</h3>
            <p>
              When you upload a mobile money statement PDF, the file is processed entirely in server memory
              to extract transaction data. <strong>We do not store, log, or retain your PDF files.</strong> The
              file is discarded immediately after processing.
            </p>
            <h3 className="font-semibold text-slate-800 mb-2 mt-4">Account Information</h3>
            <p>
              If you create an account, we collect your email address and any profile information you
              provide through our authentication provider (Clerk). This is used solely to manage your
              account and track your conversion usage.
            </p>
            <h3 className="font-semibold text-slate-800 mb-2 mt-4">Usage Data</h3>
            <p>
              We may collect anonymised usage metrics such as the number of conversions performed and
              the provider type (MTN or Airtel). This data contains no personally identifiable financial
              information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To provide and improve the PDF-to-CSV conversion service</li>
              <li>To manage your account and track monthly conversion limits</li>
              <li>To respond to your support requests</li>
              <li>To send service-related notifications (e.g. account security alerts)</li>
            </ul>
            <p className="mt-3">We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Data Security</h2>
            <p>
              PDF files are processed in-memory and never written to disk or a database. HTTPS encryption
              is used for all data in transit. Account credentials are managed by Clerk, which is SOC 2
              certified and follows industry-standard security practices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Cookies</h2>
            <p>
              We use essential cookies to maintain your authentication session. We do not use tracking
              or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction or deletion of your account data</li>
              <li>Withdraw consent at any time by deleting your account</li>
            </ul>
            <p className="mt-3">To exercise these rights, contact us at <a href="mailto:hello@moair.app" className="text-blue-600 hover:underline">hello@moair.app</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Significant changes will be communicated
              via email to registered users. Continued use of the service after changes constitutes
              acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Contact</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:hello@moair.app" className="text-blue-600 hover:underline">hello@moair.app</a>.
            </p>
          </section>
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-500 py-8 px-4 text-center text-xs mt-16">
        <p>© {new Date().getFullYear()} MOAir. All rights reserved. &nbsp;·&nbsp;
          <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link> &nbsp;·&nbsp;
          <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link> &nbsp;·&nbsp;
          <Link href="/contact" className="hover:text-slate-300 transition-colors">Contact</Link>
        </p>
      </footer>
    </div>
  );
}
