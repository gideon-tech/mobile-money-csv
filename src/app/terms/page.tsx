import Link from 'next/link';
import { FileText } from 'lucide-react';

const MTN_YELLOW = '#FFCB05';
const AIRTEL_RED = '#E40000';

export const metadata = {
  title: 'Terms of Use — MOAir',
};

export default function TermsPage() {
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
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3">Terms of Use</h1>
          <p className="text-slate-500 text-sm">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        <div className="space-y-8 text-slate-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using MOAir (&quot;the Service&quot;), you agree to be bound by these Terms of Use.
              If you do not agree, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Description of Service</h2>
            <p>
              MOAir is a web-based tool that converts MTN Mobile Money and Airtel Money PDF statements
              into CSV files. The Service is provided &quot;as is&quot; and is intended for personal and
              business financial record-keeping purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Acceptable Use</h2>
            <p>You agree to use the Service only for lawful purposes. You must not:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Upload files that do not belong to you or that you are not authorised to process</li>
              <li>Attempt to reverse-engineer, scrape, or abuse the Service</li>
              <li>Use the Service to process fraudulent or forged documents</li>
              <li>Circumvent any rate limits or usage restrictions</li>
              <li>Use automated tools to make excessive requests to the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Free Tier Limits</h2>
            <p>
              Free accounts are limited to 5 conversions per calendar month. We reserve the right to
              adjust these limits at any time with reasonable notice. Paid plans are subject to their
              respective subscription terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Intellectual Property</h2>
            <p>
              All content, design, and code comprising the MOAir Service are owned by or licensed to us.
              The CSV output files generated from your uploaded PDF statements belong to you. You retain
              full ownership of any data you upload.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Disclaimer of Warranties</h2>
            <p>
              The Service is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of
              any kind, either express or implied. We do not warrant that the Service will be error-free,
              uninterrupted, or that the parsed CSV output will be 100% accurate for all statement formats.
            </p>
            <p className="mt-3">
              You are responsible for verifying the accuracy of your exported data before using it for
              financial, tax, or accounting purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, MOAir shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages arising from your use
              of the Service, including loss of data or financial loss.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Termination</h2>
            <p>
              We reserve the right to suspend or terminate access to the Service at any time for
              violations of these Terms or for any other reason at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">9. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of Uganda.
              Any disputes arising under these Terms shall be subject to the exclusive jurisdiction
              of the courts of Uganda.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">10. Contact</h2>
            <p>
              For questions about these Terms, contact us at{' '}
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
