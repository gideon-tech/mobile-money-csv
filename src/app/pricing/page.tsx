'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Check, Minus, FileText, ArrowLeft, ArrowRight,
  Plus, Zap, Shield, BarChart3, Globe2,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

const MTN_YELLOW = '#FFCB05';
const AIRTEL_RED  = '#E40000';

// ── Data ────────────────────────────────────────────────────────────────────

const plans = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Perfect for occasional use. No commitment, no card.',
    cta: 'Start for free',
    ctaVariant: 'outline' as const,
    ctaHref: '/#upload',
    features: {
      conversions: '5 / month',
      mtn: true, airtel: true,
      categorization: false, bulk: false, templates: false,
      priority: false, api: false, whitelabel: false,
      sla: false, multiuser: false, manager: false,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 25,
    annualPrice: 20,
    description: 'For accountants and finance teams who convert regularly.',
    cta: 'Upgrade to Pro',
    ctaVariant: 'yellow' as const,
    ctaHref: '#',
    popular: true,
    features: {
      conversions: 'Unlimited',
      mtn: true, airtel: true,
      categorization: true, bulk: true, templates: true,
      priority: true, api: false, whitelabel: false,
      sla: false, multiuser: false, manager: false,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: null,
    annualPrice: null,
    description: 'For fintechs, banks, and large accounting firms.',
    cta: 'Contact us',
    ctaVariant: 'red' as const,
    ctaHref: 'mailto:hello@moair.app',
    features: {
      conversions: 'Unlimited',
      mtn: true, airtel: true,
      categorization: true, bulk: true, templates: true,
      priority: true, api: true, whitelabel: true,
      sla: true, multiuser: true, manager: true,
    },
  },
] as const;

const featureRows: { key: keyof (typeof plans)[0]['features']; label: string; type: 'text' | 'bool' }[] = [
  { key: 'conversions',    label: 'Conversions per month',       type: 'text' },
  { key: 'mtn',            label: 'MTN Mobile Money',            type: 'bool' },
  { key: 'airtel',         label: 'Airtel Money',                type: 'bool' },
  { key: 'categorization', label: 'Advanced categorization',     type: 'bool' },
  { key: 'bulk',           label: 'Bulk PDF upload',             type: 'bool' },
  { key: 'templates',      label: 'Custom CSV templates',        type: 'bool' },
  { key: 'priority',       label: 'Priority support',            type: 'bool' },
  { key: 'api',            label: 'Dedicated API access',        type: 'bool' },
  { key: 'whitelabel',     label: 'White-label CSV output',      type: 'bool' },
  { key: 'sla',            label: 'SLA & uptime guarantee',      type: 'bool' },
  { key: 'multiuser',      label: 'Multi-user team access',      type: 'bool' },
  { key: 'manager',        label: 'Dedicated account manager',   type: 'bool' },
];

const faqs = [
  {
    q: 'Do I need an account to use MOAir?',
    a: 'No. The free tier requires no sign-up at all. Create an account when you want to track conversion history or unlock Pro features.',
  },
  {
    q: 'Which statement formats are supported?',
    a: 'MOAir currently supports MTN Mobile Money Uganda (MoMo) and Airtel Money Uganda PDF statements. Export the PDF directly from your mobile app.',
  },
  {
    q: 'Is my data safe?',
    a: 'Your PDF is processed entirely in memory on our server — it is never written to disk or stored. The moment conversion is complete, it is gone.',
  },
  {
    q: 'How do I cancel my Pro plan?',
    a: 'Cancel any time from your account dashboard. You keep Pro access until the end of the current billing period with no penalties.',
  },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [annual, setAnnual]   = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex flex-shrink-0">
              <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: MTN_YELLOW }}>
                <FileText className="w-3 h-3" style={{ color: '#1a1a1a' }} />
              </div>
              <div className="flex-1" style={{ backgroundColor: AIRTEL_RED }} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">MOAir</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/#how-it-works" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">
              How it works
            </Link>
            <Link href="/#providers" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">
              Networks
            </Link>
            <Link href="/pricing" className="text-sm font-semibold text-slate-900 dark:text-white">
              Pricing
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors px-3 py-1.5">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  className="text-sm font-bold px-4 py-2 rounded-lg text-slate-900 transition-all hover:opacity-90"
                  style={{ backgroundColor: MTN_YELLOW }}
                >
                  Sign up free
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="pt-20 pb-12 px-4 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-8 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to home
        </Link>

        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
          Pricing
        </p>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          Start free.{' '}
          <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
            Scale
          </span>{' '}
          when you&apos;re ready.
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-10">
          No hidden fees. No credit card required to start. Cancel any time.
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-full p-1">
          <button
            onClick={() => setAnnual(false)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              !annual
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
              annual
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Annual
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded-full">
              Save 20%
            </span>
          </button>
        </div>
      </section>

      {/* ── PRICING CARDS ── */}
      <section className="px-4 pb-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 items-stretch">

          {/* Free */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-sm flex flex-col">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Free</p>
            <div className="mb-1">
              <span className="text-5xl font-extrabold text-slate-900 dark:text-white">$0</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">per month, forever</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 border-t border-slate-100 dark:border-slate-800 pt-4">
              {plans[0].description}
            </p>
            <ul className="space-y-3 mb-8 flex-1">
              {(['5 conversions / month', 'MTN & Airtel support', 'Standard CSV export', 'No sign-up required'] as const).map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/#upload"
              className="w-full py-3 rounded-xl font-bold text-sm text-slate-900 dark:text-white border-2 border-slate-900 dark:border-slate-500 hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 transition-all text-center"
            >
              Get started free
            </Link>
          </div>

          {/* Pro */}
          <div
            className="rounded-2xl p-8 shadow-xl relative overflow-hidden flex flex-col"
            style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}
          >
            {/* Most popular badge */}
            <div
              className="absolute top-5 right-5 text-xs font-bold px-3 py-1 rounded-full"
              style={{ backgroundColor: MTN_YELLOW, color: '#1a1a1a' }}
            >
              Most popular
            </div>

            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Pro</p>
            <div className="mb-1 flex items-end gap-2">
              <span className="text-5xl font-extrabold text-white">
                ${annual ? plans[1].annualPrice : plans[1].monthlyPrice}
              </span>
              <span className="text-slate-400 text-sm mb-1.5">/mo</span>
            </div>
            <p className="text-sm text-slate-400 mb-3">
              {annual ? 'billed $240 / year' : 'billed monthly'}
            </p>
            <p className="text-sm text-slate-400 leading-relaxed mb-6 border-t border-slate-700 pt-4">
              {plans[1].description}
            </p>
            <ul className="space-y-3 mb-8 flex-1">
              {(['Unlimited conversions', 'MTN & Airtel support', 'Advanced categorization', 'Bulk PDF upload', 'Custom CSV templates', 'Priority support'] as const).map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-white">
                  <Check className="w-4 h-4 flex-shrink-0" style={{ color: MTN_YELLOW }} />
                  {f}
                </li>
              ))}
            </ul>
            <button
              className="w-full py-3 rounded-xl font-bold text-slate-900 transition-all hover:opacity-90 text-sm"
              style={{ backgroundColor: MTN_YELLOW }}
            >
              Upgrade to Pro
            </button>
            {annual && (
              <p className="text-center text-xs text-emerald-400 mt-3">
                You save $60 per year
              </p>
            )}
          </div>

          {/* Enterprise */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-600 rounded-2xl p-8 shadow-sm flex flex-col relative overflow-hidden">
            {/* Decorative gradient corner */}
            <div
              className="absolute top-0 right-0 w-28 h-28 opacity-[0.06] dark:opacity-[0.12]"
              style={{ background: `linear-gradient(135deg, ${MTN_YELLOW}, ${AIRTEL_RED})`, borderRadius: '0 1rem 0 100%' }}
            />
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Enterprise</p>
            <div className="mb-1">
              <span className="text-5xl font-extrabold text-slate-900 dark:text-white">Custom</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">tailored to your team</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 border-t border-slate-100 dark:border-slate-800 pt-4">
              {plans[2].description}
            </p>
            <ul className="space-y-3 mb-8 flex-1">
              {(['Everything in Pro', 'Dedicated API access', 'White-label CSV output', 'SLA & uptime guarantee', 'Multi-user team access', 'Dedicated account manager'] as const).map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <Check className="w-4 h-4 flex-shrink-0 text-slate-900 dark:text-slate-300" />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="mailto:hello@moair.app"
              className="w-full py-3 rounded-xl font-bold text-white text-sm text-center transition-all hover:opacity-90 block"
              style={{ backgroundColor: AIRTEL_RED }}
            >
              Contact us
            </a>
            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-3">
              We&apos;ll respond within 24 hours
            </p>
          </div>

        </div>
      </section>

      {/* ── TRUST BADGES ── */}
      <section className="py-8 px-4 border-y border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { icon: <Zap className="w-5 h-5" />, text: 'Under 5 seconds', color: '#f59e0b' },
            { icon: <Shield className="w-5 h-5" />, text: 'Zero data stored', color: '#10b981' },
            { icon: <BarChart3 className="w-5 h-5" />, text: 'Excel & QuickBooks', color: '#6366f1' },
            { icon: <Globe2 className="w-5 h-5" />, text: 'Built for Africa', color: AIRTEL_RED },
          ].map(({ icon, text, color }) => (
            <div key={text} className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}18`, color }}>
                {icon}
              </div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURE COMPARISON TABLE (desktop only) ── */}
      <section className="hidden lg:block py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-10">
            Full feature comparison
          </h2>

          <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
              <div className="px-6 py-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Feature</div>
              <div className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-slate-200 text-center">Free</div>
              <div className="px-6 py-4 text-sm font-bold text-center" style={{ color: MTN_YELLOW }}>Pro</div>
              <div className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-slate-200 text-center">Enterprise</div>
            </div>

            {/* Rows */}
            {featureRows.map((row, i) => (
              <div
                key={row.key}
                className={`grid grid-cols-4 border-t border-slate-100 dark:border-slate-800 ${
                  i % 2 === 0
                    ? 'bg-white dark:bg-slate-900'
                    : 'bg-slate-50/60 dark:bg-slate-800/20'
                }`}
              >
                <div className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{row.label}</div>
                {plans.map((plan) => {
                  const val = plan.features[row.key];
                  return (
                    <div key={plan.id} className="px-6 py-4 flex items-center justify-center">
                      {row.type === 'text' ? (
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{val as string}</span>
                      ) : val ? (
                        <Check className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Minus className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-12">
            Frequently asked questions
          </h2>

          <div className="divide-y divide-slate-200 dark:divide-slate-700 border-y border-slate-200 dark:border-slate-700">
            {faqs.map((faq, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left py-5 flex items-start justify-between gap-4 group"
                >
                  <span className="font-semibold text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                    {faq.q}
                  </span>
                  {openFaq === i
                    ? <Minus className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-1" />
                    : <Plus className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-1" />
                  }
                </button>
                {openFaq === i && (
                  <p className="pb-5 text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="py-24 px-4 text-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Ready to start?</p>
        <h2 className="text-4xl font-extrabold text-white mb-4">
          Convert your first statement free
        </h2>
        <p className="text-slate-400 max-w-md mx-auto mb-8">
          No account needed. Upload your PDF and download clean CSV in under 5 seconds.
        </p>
        <Link
          href="/#upload"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-slate-900 font-bold text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          style={{ backgroundColor: MTN_YELLOW }}
        >
          Start converting free <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-950 text-slate-500 py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md overflow-hidden flex flex-shrink-0">
              <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: MTN_YELLOW }}>
                <FileText className="w-2 h-2" style={{ color: '#1a1a1a' }} />
              </div>
              <div className="flex-1" style={{ backgroundColor: AIRTEL_RED }} />
            </div>
            <span className="font-bold text-white">MOAir</span>
          </div>
          <p>© {new Date().getFullYear()} MOAir. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
