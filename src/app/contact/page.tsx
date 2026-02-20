'use client';

import Link from 'next/link';
import { FileText, Mail, MessageSquare, Building2, CheckCircle } from 'lucide-react';
import { useState } from 'react';

const MTN_YELLOW = '#FFCB05';
const AIRTEL_RED = '#E40000';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: 'General Enquiry', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Opens the user's mail client with the form data pre-filled.
    // For a production app, replace this with a server action or API call.
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    const subject = encodeURIComponent(`[MOAir] ${form.subject}`);
    window.location.href = `mailto:hello@moair.app?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

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

      <main className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Get in touch</p>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3">Contact Us</h1>
          <p className="text-slate-500 max-w-xl mx-auto">Have a question, found a bug, or want to discuss enterprise access? We&apos;d love to hear from you.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">

          {/* Contact info sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: '#fffbeb', color: '#f59e0b' }}>
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Email Us</h3>
              <p className="text-sm text-slate-500 mb-2">For general enquiries and support</p>
              <a href="mailto:hello@moair.app" className="text-sm font-medium text-blue-600 hover:underline">hello@moair.app</a>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Support</h3>
              <p className="text-sm text-slate-500">We typically respond within 24 hours on business days.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: '#eef2ff', color: '#6366f1' }}>
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Enterprise</h3>
              <p className="text-sm text-slate-500 mb-2">Need API access, white-labelling, or a custom plan?</p>
              <a href="mailto:hello@moair.app?subject=[MOAir]%20Enterprise%20Enquiry" className="text-sm font-medium" style={{ color: AIRTEL_RED }}>
                Contact enterprise sales →
              </a>
            </div>
          </div>

          {/* Contact form */}
          <div className="md:col-span-2">
            {submitted ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 flex flex-col items-center justify-center text-center h-full">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Message sent!</h2>
                <p className="text-slate-500 text-sm max-w-xs">Your email client should have opened. We&apos;ll get back to you within 24 hours.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-sm font-medium text-slate-500 hover:text-slate-900 underline transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Send a message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Your name"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="you@example.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-white"
                    >
                      <option>General Enquiry</option>
                      <option>Bug Report</option>
                      <option>Feature Request</option>
                      <option>Enterprise / API Access</option>
                      <option>Billing</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us how we can help..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl font-bold text-slate-900 text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2"
                    style={{ backgroundColor: MTN_YELLOW }}
                  >
                    <Mail className="w-4 h-4" />
                    Send Message
                  </button>
                  <p className="text-center text-xs text-slate-400">This will open your email client to send the message.</p>
                </form>
              </div>
            )}
          </div>
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
