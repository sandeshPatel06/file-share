"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Mail,
  ShieldAlert,
  Clock,
  Send,
  MessageSquare,
  Building2,
  CheckCircle2,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { CookieSettingsButton } from "@/components/ui/CookieConsent";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("support");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) return;
    setSubmitting(true);
    // Create mailto fallback link for instant dispatch
    setTimeout(() => {
      const subject = encodeURIComponent(`[${category.toUpperCase()}] Inquiry from ${name}`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nCategory: ${category}\n\nMessage:\n${message}\n\n[Consent given under GDPR / India DPDP Act 2023]`
      );
      window.location.href = `mailto:support@fileshare.shptechnology.online?subject=${subject}&body=${body}`;
      setSubmitting(false);
      setSubmitted(true);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--header-bg)] border-b border-[var(--border-color)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-base tracking-tight">
            <div className="w-7 h-7 rounded-md bg-[var(--accent-primary)] flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <span>FileShare</span>
          </Link>
          <nav className="flex items-center gap-4 text-xs font-medium text-[var(--text-muted)]">
            <Link href="/about" className="hover:text-[var(--text-main)] transition-colors">About</Link>
            <Link href="/privacy" className="hover:text-[var(--text-main)] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--text-main)] transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-[var(--text-main)] transition-colors">Cookies</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>
        </div>

        <div className="mb-10 border-b border-[var(--border-color)] pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-muted)] mb-3">
            <MessageSquare className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span>Support &amp; Grievance Redressal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Contact &amp; Grievance Redressal Center
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed max-w-2xl">
            Get in touch with the FileShare team. Technical assistance, statutory grievance redressal under India&apos;s DPDP Act 2023, and abuse/DMCA takedown notifications.
          </p>
        </div>

        {/* Business & Grievance Details Box */}
        <section className="mb-10 p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[var(--accent-primary)]" />
            <h2 className="text-base font-bold text-[var(--text-main)]">
              Registered Business &amp; Statutory Authority Information
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-1">
              <div><span className="text-[var(--text-subtle)]">Operating Entity:</span> <strong>SHP Technology</strong></div>
              <div><span className="text-[var(--text-subtle)]">Lead Developer / Founder:</span> Sandesh Patel</div>
              <div><span className="text-[var(--text-subtle)]">Registered Office:</span> 1st floor, SHP Technology, Near Underground Bridge, Madan Mahal Station, Jabalpur, Madhya Pradesh 482001, India</div>
              <div><span className="text-[var(--text-subtle)]">GST Status:</span> Exempt / Unregistered under threshold (Sec 22, CGST Act)</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] space-y-1">
              <div><span className="text-[var(--text-subtle)]">Grievance Redressal Officer:</span> Sandesh Patel</div>
              <div><span className="text-[var(--text-subtle)]">Statutory Email:</span> grievance@fileshare.shptechnology.online</div>
              <div><span className="text-[var(--text-subtle)]">Abuse / DMCA:</span> abuse@fileshare.shptechnology.online</div>
              <div><span className="text-[var(--text-subtle)]">Support:</span> support@fileshare.shptechnology.online</div>
            </div>
          </div>
        </section>

        {/* Direct Contact Channels */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
                <Mail className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[var(--text-main)] mb-1">General &amp; Technical Support</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
                Questions about workspace features, browser issues, or technical assistance.
              </p>
            </div>
            <a
              href="mailto:support@fileshare.shptechnology.online"
              className="text-xs font-mono text-[var(--accent-primary)] hover:underline break-all"
            >
              support@fileshare.shptechnology.online
            </a>
          </div>

          <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[var(--text-main)] mb-1">Abuse &amp; DMCA Takedowns</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
                Report copyrighted material, phishing, malware, or statutory policy violations.
              </p>
            </div>
            <a
              href="mailto:abuse@fileshare.shptechnology.online"
              className="text-xs font-mono text-amber-400 hover:underline break-all"
            >
              abuse@fileshare.shptechnology.online
            </a>
          </div>

          <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[var(--text-main)] mb-1">Response Time SLA</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
                Critical abuse and security reports triaged within <strong>12 to 24 hours</strong>; general inquiries in 1-2 business days.
              </p>
            </div>
            <span className="text-xs font-mono text-[var(--text-subtle)]">
              Mon – Fri | 09:00 – 18:00 IST
            </span>
          </div>
        </div>

        {/* Accessible Contact Form with Form Consent Checkbox */}
        <section className="bg-[var(--bg-surface)] p-6 sm:p-8 rounded-2xl border border-[var(--border-color)] space-y-6">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-main)] mb-1">
              Send a Direct Message
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              All form fields are strictly necessary to process and reply to your inquiry. Zero extraneous personal data is requested.
            </p>
          </div>

          {submitted ? (
            <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-[var(--text-main)]">Thank You for Reaching Out</h3>
              <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
                Your email client has been prepared. If your mail client did not open automatically, please send your email directly to <code className="font-mono text-[var(--accent-primary)]">support@fileshare.shptechnology.online</code>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-bold text-[var(--text-main)] mb-1 font-mono">
                    Full Name <span className="text-red-400" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    aria-required="true"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--input-bg)] border border-[var(--border-color)] text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-xs font-bold text-[var(--text-main)] mb-1 font-mono">
                    Email Address <span className="text-red-400" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    aria-required="true"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--input-bg)] border border-[var(--border-color)] text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-category" className="block text-xs font-bold text-[var(--text-main)] mb-1 font-mono">
                  Inquiry Department <span className="text-red-400" aria-hidden="true">*</span>
                </label>
                <select
                  id="contact-category"
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--input-bg)] border border-[var(--border-color)] text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-primary)]"
                >
                  <option value="support">General Technical Support</option>
                  <option value="grievance">Data Privacy / DPDP Act Grievance</option>
                  <option value="abuse">DMCA Copyright Infringement &amp; Abuse</option>
                  <option value="security">Vulnerability Disclosure</option>
                </select>
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs font-bold text-[var(--text-main)] mb-1 font-mono">
                  Message Details <span className="text-red-400" aria-hidden="true">*</span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide detailed information regarding your inquiry, including any relevant workspace URL slugs (/s/[slug])..."
                  aria-required="true"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--input-bg)] border border-[var(--border-color)] text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-primary)]"
                />
              </div>

              {/* Form Consent Checkbox (DPDP Act 2023 & GDPR Mandate) */}
              <div className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                <label htmlFor="contact-consent-checkbox" className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    id="contact-consent-checkbox"
                    name="consent"
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    aria-required="true"
                    className="mt-0.5 w-4 h-4 rounded border-gray-400 text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] cursor-pointer"
                  />
                  <span className="text-xs text-[var(--text-muted)] leading-relaxed">
                    I explicitly consent to SHP Technology processing my name and email address solely for the purpose of investigating and responding to this inquiry, in compliance with India&apos;s Digital Personal Data Protection (DPDP) Act, 2023 and the EU GDPR. Read our{" "}
                    <Link href="/privacy" className="text-[var(--accent-primary)] underline hover:text-[var(--text-main)]">
                      Privacy Policy
                    </Link>.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting || !consent}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                aria-label="Send contact inquiry"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Preparing Message...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Inquiries
                  </>
                )}
              </button>
            </form>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] py-8 bg-[var(--header-bg)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <p>© 2026 FileShare (SHP Technology). All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/" className="hover:text-[var(--text-main)] transition-colors">Home</Link>
            <span>•</span>
            <Link href="/about" className="hover:text-[var(--text-main)] transition-colors">About</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-[var(--text-main)] transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[var(--text-main)] transition-colors">Terms &amp; Conditions</Link>
            <span>•</span>
            <Link href="/cookies" className="hover:text-[var(--text-main)] transition-colors">Cookie Policy</Link>
            <span>•</span>
            <Link href="/refund" className="hover:text-[var(--text-main)] transition-colors">Refund Policy</Link>
            <span>•</span>
            <CookieSettingsButton />
          </div>
        </div>
      </footer>
    </div>
  );
}
