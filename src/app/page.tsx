'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FileText, Download, Shield, Zap, Upload, CheckCircle,
  Lock, Globe2, BarChart3, Smartphone, ArrowRight, X,
  AlertCircle, Loader2,
} from 'lucide-react';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { ThemeToggle } from '@/components/ThemeToggle';

type Provider    = 'MTN' | 'Airtel' | null;
type ConvertState = 'idle' | 'converting' | 'success' | 'error';

const MTN_YELLOW = '#FFCB05';
const AIRTEL_RED = '#E40000';

function MTNLogo({ className, invert = false }: { className?: string; invert?: boolean }) {
  return (
    <Image
      src="/mtn-logo.svg"
      alt="MTN Mobile Money"
      width={80}
      height={40}
      className={className}
      style={invert ? { filter: 'brightness(0) invert(1)' } : undefined}
    />
  );
}

function AirtelLogo({ className, invert = false }: { className?: string; invert?: boolean }) {
  return (
    <Image
      src="/airtel-logo.svg"
      alt="Airtel Money"
      width={90}
      height={35}
      className={className}
      style={invert ? { filter: 'brightness(0) invert(1)' } : undefined}
    />
  );
}

export default function HomePage() {
  const [isDragging, setIsDragging]         = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider>(null);
  const [uploadedFile, setUploadedFile]     = useState<File | null>(null);
  const [convertState, setConvertState]     = useState<ConvertState>('idle');
  const [errorMessage, setErrorMessage]     = useState('');
  const [txCount, setTxCount]               = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      setConvertState('idle');
      setErrorMessage('');
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setConvertState('idle');
      setErrorMessage('');
    }
  }, []);

  const clearFile = () => {
    setUploadedFile(null);
    setConvertState('idle');
    setErrorMessage('');
    setTxCount(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConvert = async () => {
    if (!uploadedFile || !selectedProvider) return;

    setConvertState('converting');
    setErrorMessage('');
    setTxCount(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('provider', selectedProvider);

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Conversion failed.' }));
        setErrorMessage(data.error ?? 'Conversion failed. Please try again.');
        setConvertState('error');
        return;
      }

      const count = response.headers.get('X-Transaction-Count');
      if (count) setTxCount(parseInt(count, 10));

      const blob = await response.blob();
      const disposition = response.headers.get('Content-Disposition') ?? '';
      const nameMatch = disposition.match(/filename="(.+?)"/);
      const filename = nameMatch ? nameMatch[1] : `${selectedProvider}_statement.csv`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setConvertState('success');
    } catch {
      setErrorMessage('A network error occurred. Please check your connection and try again.');
      setConvertState('error');
    }
  };

  const scrollToUpload = (provider: 'MTN' | 'Airtel') => {
    setSelectedProvider(provider);
    setConvertState('idle');
    setErrorMessage('');
    document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' });
  };

  const accentColor = selectedProvider === 'MTN' ? MTN_YELLOW : selectedProvider === 'Airtel' ? AIRTEL_RED : '#e2e8f0';
  const accentText  = selectedProvider === 'MTN' ? '#1a1a1a' : selectedProvider === 'Airtel' ? '#ffffff' : '#94a3b8';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex flex-shrink-0">
              <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: MTN_YELLOW }}>
                <FileText className="w-3 h-3" style={{ color: '#1a1a1a' }} />
              </div>
              <div className="flex-1" style={{ backgroundColor: AIRTEL_RED }} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">MOAir</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#how-it-works" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">How it works</a>
            <a href="#providers"    className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">Supported Networks</a>
            <Link href="/pricing"   className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">Pricing</Link>
          </nav>

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
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-4 bg-white/10 border border-white/20 rounded-full px-6 py-2.5 mb-10 backdrop-blur-sm">
            <span className="text-xs text-slate-300 font-semibold uppercase tracking-widest">Supported Networks</span>
            <div className="w-px h-5 bg-white/20" />
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ backgroundColor: MTN_YELLOW }}>
                <MTNLogo className="h-4 w-auto" />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white">
                <AirtelLogo className="h-4 w-auto" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
            Turn Mobile Money Statements{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              into Clean CSV
            </span>
          </h1>

          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload your <strong className="text-white">MTN Mobile Money</strong> or{' '}
            <strong className="text-white">Airtel Money</strong> PDF statement and download
            a perfectly formatted CSV — ready for Excel, QuickBooks, or any accounting tool.
          </p>

          <div className="flex flex-wrap justify-center gap-5 text-sm text-slate-400 mb-10">
            <div className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-green-400" /><span>Never stored</span></div>
            <div className="w-px h-4 bg-slate-700 self-center" />
            <div className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-yellow-400" /><span>Instant conversion</span></div>
            <div className="w-px h-4 bg-slate-700 self-center" />
            <div className="flex items-center gap-1.5"><Globe2 className="w-4 h-4 text-blue-400" /><span>Built for Africa</span></div>
          </div>

          <a
            href="#upload"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-slate-900 font-bold text-base shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            style={{ backgroundColor: MTN_YELLOW }}
          >
            Start Converting Free <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-5 grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100 dark:divide-slate-800">
          {[
            { value: '50,000+', label: 'Statements Converted' },
            { value: '2',       label: 'Networks Supported' },
            { value: '< 5s',    label: 'Average Processing' },
            { value: '100%',    label: 'Privacy Guaranteed' },
          ].map((stat) => (
            <div key={stat.label} className="text-center px-4 py-1">
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── UPLOAD SECTION ── */}
      <section id="upload" className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Upload Your Statement</h2>
          <p className="text-slate-500 dark:text-slate-400">Select your mobile money network, then drop your PDF</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">

          {/* Provider Selector Tabs */}
          <div className="grid grid-cols-2">
            {(['MTN', 'Airtel'] as const).map((p) => {
              const isActive = selectedProvider === p;
              const isMTN    = p === 'MTN';
              return (
                <button
                  key={p}
                  onClick={() => { setSelectedProvider(p); setConvertState('idle'); setErrorMessage(''); }}
                  className="relative flex flex-col items-center justify-center gap-2 py-6 font-semibold transition-all border-b-2"
                  style={
                    isActive
                      ? { backgroundColor: isMTN ? MTN_YELLOW : AIRTEL_RED, borderBottomColor: isMTN ? '#b8960a' : '#b50000' }
                      : { borderBottomColor: 'transparent' }
                  }
                >
                  <div className={`flex items-center justify-center rounded-lg px-3 py-1.5 ${
                    isActive
                      ? (isMTN ? 'bg-black/10' : 'bg-white/20')
                      : 'bg-slate-100 dark:bg-slate-800'
                  }`}>
                    {isMTN
                      ? <MTNLogo className="h-6 w-auto" />
                      : <AirtelLogo className="h-6 w-auto" invert={isActive} />
                    }
                  </div>
                  <span
                    className="text-xs font-bold"
                    style={{ color: isActive ? (isMTN ? '#1a1a1a' : '#ffffff') : undefined }}
                  >
                    {isMTN ? 'MTN Mobile Money' : 'Airtel Money'}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="p-8">
            {convertState !== 'success' && (
              <>
                {!uploadedFile ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => selectedProvider && fileInputRef.current?.click()}
                    className={`
                      relative flex flex-col items-center justify-center
                      border-2 border-dashed rounded-xl py-14 px-8
                      transition-all duration-200 text-center
                      ${selectedProvider ? 'cursor-pointer' : 'cursor-default'}
                      ${isDragging
                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/40 scale-[1.01]'
                        : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-750'
                      }
                    `}
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-4">
                      <Upload className={`w-7 h-7 ${isDragging ? 'text-blue-500' : 'text-slate-500 dark:text-slate-400'}`} />
                    </div>
                    <p className="text-slate-700 dark:text-slate-200 font-semibold text-lg mb-1">Drop your PDF statement here</p>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mb-4">or click to browse files</p>
                    <span className="inline-block text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full">
                      PDF files only · Max 10 MB
                    </span>

                    {!selectedProvider && (
                      <div className="absolute inset-0 rounded-xl bg-white/80 dark:bg-slate-900/80 flex items-center justify-center backdrop-blur-sm">
                        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-5 py-3 rounded-xl shadow border border-slate-200 dark:border-slate-600">
                          <div className="flex items-center gap-2">
                            <div className="px-2 py-1 rounded" style={{ backgroundColor: MTN_YELLOW }}>
                              <MTNLogo className="h-4 w-auto" />
                            </div>
                            <span className="text-slate-400 text-xs">or</span>
                            <div className="px-2 py-1 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                              <AirtelLogo className="h-4 w-auto" />
                            </div>
                          </div>
                          <span className="text-slate-600 dark:text-slate-300 font-medium text-sm">Select a network above</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl px-5 py-4">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{uploadedFile.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB · PDF
                        {selectedProvider && (
                          <span className="ml-2 font-medium" style={{ color: selectedProvider === 'MTN' ? '#b8960a' : AIRTEL_RED }}>
                            · {selectedProvider === 'MTN' ? 'MTN Mobile Money' : 'Airtel Money'}
                          </span>
                        )}
                      </p>
                    </div>
                    <button onClick={clearFile} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors" disabled={convertState === 'converting'}>
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}

            <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange} disabled={!selectedProvider} />

            {convertState === 'error' && (
              <div className="mt-5 flex items-start gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-5 py-4">
                <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-700 dark:text-red-400 text-sm">Conversion failed</p>
                  <p className="text-red-600 dark:text-red-400 text-sm mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            {convertState === 'success' && (
              <div className="flex flex-col items-center text-center py-6">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">CSV Downloaded!</h3>
                {txCount !== null && (
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{txCount}</span> transactions exported
                  </p>
                )}
                <p className="text-slate-400 dark:text-slate-500 text-sm mb-6">Check your downloads folder.</p>
                <button
                  onClick={clearFile}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold border-2 border-slate-900 dark:border-slate-400 text-slate-900 dark:text-white hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 transition-all"
                >
                  <Upload className="w-4 h-4" /> Convert Another Statement
                </button>
              </div>
            )}

            {convertState !== 'success' && (
              <>
                <button
                  onClick={handleConvert}
                  disabled={!uploadedFile || !selectedProvider || convertState === 'converting'}
                  className="mt-6 w-full py-4 rounded-xl font-bold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:hover:shadow-md"
                  style={{ backgroundColor: accentColor, color: accentText }}
                >
                  {convertState === 'converting' ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing PDF...</>
                  ) : (
                    <><Download className="w-5 h-5" /> Convert to CSV &amp; Download</>
                  )}
                </button>
                <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-3">
                  Free · 5 conversions/month · No sign-up needed
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-16 px-4 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">How It Works</h2>
            <p className="text-slate-500 dark:text-slate-400">Three steps to clean financial data</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: <Smartphone className="w-6 h-6" />, title: 'Export Your PDF', desc: 'Open your MTN or Airtel app, navigate to statements, and download your transaction history as a PDF.' },
              { step: '02', icon: <Upload className="w-6 h-6" />,     title: 'Upload to MOAir', desc: 'Select your network, drop the PDF, and hit Convert. No account required for free conversions.' },
              { step: '03', icon: <Download className="w-6 h-6" />,   title: 'Download CSV',    desc: 'Your clean CSV arrives instantly — with dates, amounts, fees, taxes, counterparties and references.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="relative text-center">
                <div className="inline-flex flex-col items-center">
                  <div className="text-xs font-black text-slate-300 dark:text-slate-600 mb-3 tracking-widest">{step}</div>
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center mb-4 shadow-lg">{icon}</div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">{title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROVIDER CARDS ── */}
      <section id="providers" className="py-16 px-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Supported Networks</h2>
            <p className="text-slate-500 dark:text-slate-400">Precision-tuned for the formats used by each provider</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">

            {/* MTN Card */}
            <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-700">
              <div className="px-8 py-6 flex items-center justify-between" style={{ backgroundColor: MTN_YELLOW }}>
                <div>
                  <MTNLogo className="h-10 w-auto mb-2" />
                  <p className="text-sm font-medium text-yellow-900">MTN Mobile Money</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-yellow-800 font-semibold uppercase tracking-widest">Uganda</p>
                  <p className="text-sm font-medium text-yellow-900">MTN · MoMo</p>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 px-8 py-6">
                <ul className="space-y-3">
                  {['Send Money transactions', 'Receive Money transactions', 'Cash Out (Withdraw)', 'Cash In (Deposit)', 'Bill payments', 'Airtime & data top-ups'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: MTN_YELLOW }} />{item}
                    </li>
                  ))}
                </ul>
                <button onClick={() => scrollToUpload('MTN')} className="mt-6 w-full py-3 rounded-xl font-bold text-sm text-slate-900 flex items-center justify-center gap-2 transition-all hover:opacity-80" style={{ backgroundColor: MTN_YELLOW }}>
                  Convert MTN Statement <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Airtel Card */}
            <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-700">
              <div className="px-8 py-6 flex items-center justify-between" style={{ backgroundColor: AIRTEL_RED }}>
                <div>
                  <AirtelLogo className="h-10 w-auto mb-2" invert />
                  <p className="text-sm font-medium text-red-100">Airtel Money</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-red-200 font-semibold uppercase tracking-widest">Uganda &amp; beyond</p>
                  <p className="text-sm font-medium text-red-100">Airtel · Uganda &amp; beyond</p>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 px-8 py-6">
                <ul className="space-y-3">
                  {['Send Money transactions', 'Receive Money transactions', 'Bill payments', 'Withdraw & Deposit records', 'Airtime & data top-ups', 'Opening & Closing balances'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: AIRTEL_RED }} />{item}
                    </li>
                  ))}
                </ul>
                <button onClick={() => scrollToUpload('Airtel')} className="mt-6 w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90" style={{ backgroundColor: AIRTEL_RED }}>
                  Convert Airtel Statement <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-16 px-4 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Why MOAir?</h2>
            <p className="text-slate-500 dark:text-slate-400">Built specifically for African mobile money users</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Zap className="w-6 h-6" />,      title: 'Instant Results',    desc: 'Get your CSV in under 5 seconds. No waiting, no queues.',                          color: '#f59e0b', bg: '#fffbeb', darkBg: '#451a031a' },
              { icon: <Shield className="w-6 h-6" />,   title: 'Zero Data Storage', desc: 'Your PDF is processed in memory and deleted immediately.',                          color: '#10b981', bg: '#ecfdf5', darkBg: '#052e161a' },
              { icon: <BarChart3 className="w-6 h-6" />, title: 'Accounting Ready',  desc: 'Output CSV works with Excel, QuickBooks, Xero, Wave & more.',                      color: '#6366f1', bg: '#eef2ff', darkBg: '#1e1b4b1a' },
              { icon: <Globe2 className="w-6 h-6" />,   title: 'African Networks',   desc: 'Precision-tuned parsers for MTN MoMo & Airtel Money formats.',                     color: '#ef4444', bg: '#fef2f2', darkBg: '#450a0a1a' },
            ].map(({ icon, title, desc, color, bg }) => (
              <div key={title} className="rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md dark:hover:shadow-slate-900 transition-shadow bg-white dark:bg-slate-800/50">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: bg, color }}>{icon}</div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1.5">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-16 px-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">What Our Users Say</h2>
            <p className="text-slate-500 dark:text-slate-400">Real people saving real time with MOAir</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">

            {/* Sarah – Accountant */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-7 shadow-sm flex flex-col gap-5">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="#FFCB05"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                ))}
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed flex-1">
                &ldquo;I reconcile mobile money records for three SME clients every month. Before MOAir, it was two hours of copy-pasting. Now it&apos;s literally two minutes. The CSV columns map perfectly into QuickBooks — no cleanup needed.&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Image
                  src="/testimonials/sarah.svg"
                  alt="Sarah Nakato"
                  width={48}
                  height={48}
                  className="rounded-full flex-shrink-0"
                />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">Sarah Nakato</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Certified Accountant · Kampala</p>
                </div>
              </div>
            </div>

            {/* David – Business Owner */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-7 shadow-sm flex flex-col gap-5 md:scale-[1.02] md:shadow-md">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="#FFCB05"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                ))}
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed flex-1">
                &ldquo;I run a wholesale shop and almost all payments come through MTN MoMo. Tracking them used to be a nightmare. MOAir turned a 6-month statement into a clean spreadsheet in seconds. My accountant was shocked.&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Image
                  src="/testimonials/david.svg"
                  alt="David Okonkwo"
                  width={48}
                  height={48}
                  className="rounded-full flex-shrink-0"
                />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">David Okonkwo</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Wholesale Business Owner · Entebbe</p>
                </div>
              </div>
            </div>

            {/* Grace – Freelancer */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-7 shadow-sm flex flex-col gap-5">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="#FFCB05"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                ))}
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed flex-1">
                &ldquo;As a freelancer, I get paid on both Airtel and MTN. Tax season was always stressful pulling records together. MOAir handles both networks and I have my full year transaction history exported in under a minute.&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Image
                  src="/testimonials/grace.svg"
                  alt="Grace Muwanga"
                  width={48}
                  height={48}
                  className="rounded-full flex-shrink-0"
                />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">Grace Muwanga</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Freelance Consultant · Jinja</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md overflow-hidden flex flex-shrink-0">
                <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: MTN_YELLOW }}>
                  <FileText className="w-2.5 h-2.5" style={{ color: '#1a1a1a' }} />
                </div>
                <div className="flex-1" style={{ backgroundColor: AIRTEL_RED }} />
              </div>
              <span className="font-bold text-lg text-white">MOAir</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">Trusted networks:</span>
              <div className="px-3 py-1.5 rounded-lg" style={{ backgroundColor: MTN_YELLOW }}>
                <MTNLogo className="h-4 w-auto" />
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-white">
                <AirtelLogo className="h-4 w-auto" />
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} MOAir. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/privacy"  className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
              <Link href="/terms"    className="hover:text-slate-300 transition-colors">Terms of Use</Link>
              <Link href="/contact"  className="hover:text-slate-300 transition-colors">Contact</Link>
              <Link href="/pricing"  className="hover:text-slate-300 transition-colors">Pricing</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
