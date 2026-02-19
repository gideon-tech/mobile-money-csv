<<<<<<< HEAD
'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  FileText, Download, Shield, Zap, Upload, CheckCircle,
  Lock, Globe2, BarChart3, Smartphone, ArrowRight, X,
  AlertCircle, Loader2,
} from 'lucide-react';

type Provider = 'MTN' | 'Airtel' | null;
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
=======
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Shield, Zap } from "lucide-react";
import Link from "next/link";
>>>>>>> 4a7f9b142140b32ba8b3bc3ea0179a43cc88ee17

export default function HomePage() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [convertState, setConvertState] = useState<ConvertState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [txCount, setTxCount] = useState<number | null>(null);
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

      // Read transaction count from header
      const count = response.headers.get('X-Transaction-Count');
      if (count) setTxCount(parseInt(count, 10));

      // Trigger browser download
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
  const accentText = selectedProvider === 'MTN' ? '#1a1a1a' : selectedProvider === 'Airtel' ? '#ffffff' : '#94a3b8';

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Brand icon: split diagonal — yellow left half, red right half */}
            <div className="w-8 h-8 rounded-lg overflow-hidden flex flex-shrink-0">
              <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: MTN_YELLOW }}>
                <FileText className="w-3 h-3" style={{ color: '#1a1a1a' }} />
              </div>
              <div className="flex-1" style={{ backgroundColor: AIRTEL_RED }} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">MOAir</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#how-it-works" className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors">How it works</a>
            <a href="#providers" className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors">Supported Networks</a>
            <a href="#pricing" className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex items-center px-3 py-1.5 rounded-lg" style={{ backgroundColor: MTN_YELLOW }}>
              <MTNLogo className="h-5 w-auto" />
            </div>
            <div className="flex items-center px-3 py-1.5 rounded-lg bg-white border border-slate-200">
              <AirtelLogo className="h-5 w-auto" />
            </div>
<<<<<<< HEAD
=======
            <nav className="flex space-x-4">
              <Button variant="ghost">How it Works</Button>
              <Button variant="ghost">Pricing</Button>
              <Link href="/convert">
                <Button variant="outline">Try It Free</Button>
              </Link>
            </nav>
>>>>>>> 4a7f9b142140b32ba8b3bc3ea0179a43cc88ee17
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
<<<<<<< HEAD

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
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-5 grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100">
          {[
            { value: '50,000+', label: 'Statements Converted' },
            { value: '2', label: 'Networks Supported' },
            { value: '< 5s', label: 'Average Processing' },
            { value: '100%', label: 'Privacy Guaranteed' },
          ].map((stat) => (
            <div key={stat.label} className="text-center px-4 py-1">
              <p className="text-2xl font-extrabold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── UPLOAD SECTION ── */}
      <section id="upload" className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Upload Your Statement</h2>
          <p className="text-slate-500">Select your mobile money network, then drop your PDF</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">

          {/* Provider Selector Tabs */}
          <div className="grid grid-cols-2">
            {(['MTN', 'Airtel'] as const).map((p) => {
              const isActive = selectedProvider === p;
              const isMTN = p === 'MTN';
              return (
                <button
                  key={p}
                  onClick={() => { setSelectedProvider(p); setConvertState('idle'); setErrorMessage(''); }}
                  className="relative flex flex-col items-center justify-center gap-2 py-6 font-semibold transition-all border-b-2"
                  style={
                    isActive
                      ? { backgroundColor: isMTN ? MTN_YELLOW : AIRTEL_RED, borderBottomColor: isMTN ? '#b8960a' : '#b50000' }
                      : { backgroundColor: '#f8fafc', borderBottomColor: '#e2e8f0' }
                  }
                >
                  {isMTN ? (
                    <div className={`flex items-center justify-center rounded-lg px-3 py-1.5 ${isActive ? 'bg-black/10' : 'bg-slate-200'}`}>
                      <MTNLogo className="h-6 w-auto" />
                    </div>
                  ) : (
                    <div className={`flex items-center justify-center rounded-lg px-3 py-1.5 ${isActive ? 'bg-white/20' : 'bg-slate-200'}`}>
                      <AirtelLogo className="h-6 w-auto" invert={isActive} />
                    </div>
                  )}
                  <span className="text-xs font-bold" style={{ color: isActive ? (isMTN ? '#1a1a1a' : '#ffffff') : '#64748b' }}>
                    {isMTN ? 'MTN Mobile Money' : 'Airtel Money'}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="p-8">
            {/* Drop Zone — only shown when not yet converted successfully */}
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
                      ${isDragging ? 'border-blue-400 bg-blue-50 scale-[1.01]' : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100'}
                    `}
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mb-4">
                      <Upload className={`w-7 h-7 ${isDragging ? 'text-blue-500' : 'text-slate-500'}`} />
                    </div>
                    <p className="text-slate-700 font-semibold text-lg mb-1">Drop your PDF statement here</p>
                    <p className="text-slate-400 text-sm mb-4">or click to browse files</p>
                    <span className="inline-block text-xs bg-slate-200 text-slate-600 px-3 py-1 rounded-full">
                      PDF files only · Max 10 MB
                    </span>

                    {!selectedProvider && (
                      <div className="absolute inset-0 rounded-xl bg-white/80 flex items-center justify-center backdrop-blur-sm">
                        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl shadow border border-slate-200">
                          <div className="flex items-center gap-2">
                            <div className="px-2 py-1 rounded" style={{ backgroundColor: MTN_YELLOW }}>
                              <MTNLogo className="h-4 w-auto" />
                            </div>
                            <span className="text-slate-400 text-xs">or</span>
                            <div className="px-2 py-1 rounded bg-white border border-slate-200">
                              <AirtelLogo className="h-4 w-auto" />
                            </div>
                          </div>
                          <span className="text-slate-600 font-medium text-sm">Select a network above</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-4 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{uploadedFile.name}</p>
                      <p className="text-sm text-slate-500">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB · PDF
                        {selectedProvider && (
                          <span className="ml-2 font-medium" style={{ color: selectedProvider === 'MTN' ? '#b8960a' : AIRTEL_RED }}>
                            · {selectedProvider === 'MTN' ? 'MTN Mobile Money' : 'Airtel Money'}
                          </span>
                        )}
                      </p>
                    </div>
                    <button onClick={clearFile} className="text-slate-400 hover:text-slate-700 transition-colors" disabled={convertState === 'converting'}>
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}

            <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange} disabled={!selectedProvider} />

            {/* Error message */}
            {convertState === 'error' && (
              <div className="mt-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-700 text-sm">Conversion failed</p>
                  <p className="text-red-600 text-sm mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Success message */}
            {convertState === 'success' && (
              <div className="flex flex-col items-center text-center py-6">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">CSV Downloaded!</h3>
                {txCount !== null && (
                  <p className="text-slate-500 text-sm mb-1">
                    <span className="font-semibold text-slate-700">{txCount}</span> transactions exported
                  </p>
                )}
                <p className="text-slate-400 text-sm mb-6">Check your downloads folder.</p>
                <button
                  onClick={clearFile}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-all"
                >
                  <Upload className="w-4 h-4" /> Convert Another Statement
                </button>
              </div>
            )}

            {/* Convert button */}
            {convertState !== 'success' && (
              <>
                <button
                  onClick={handleConvert}
                  disabled={!uploadedFile || !selectedProvider || convertState === 'converting'}
                  className="mt-6 w-full py-4 rounded-xl font-bold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:hover:shadow-md"
                  style={{ backgroundColor: accentColor, color: accentText }}
                >
                  {convertState === 'converting' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing PDF...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Convert to CSV &amp; Download
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-slate-400 mt-3">
                  Free · 5 conversions/month · No sign-up needed
                </p>
              </>
            )}
=======
          <div className="flex justify-center space-x-4">
            <Link href="/convert">
              <Button size="lg" className="text-lg px-8 py-3">
                Try Free (5 conversions)
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3">
              View Demo
            </Button>
>>>>>>> 4a7f9b142140b32ba8b3bc3ea0179a43cc88ee17
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-16 px-4 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">How It Works</h2>
            <p className="text-slate-500">Three simple steps to clean financial data</p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { step: '1', icon: <Smartphone className="w-6 h-6" />, title: 'Choose Network', desc: 'Click the MTN or Airtel tab that matches your PDF statement.', accent: '#3b82f6' },
              { step: '2', icon: <Upload className="w-6 h-6" />, title: 'Upload PDF', desc: 'Drag and drop your statement PDF or click to browse from your device.', accent: '#8b5cf6' },
              { step: '3', icon: <Download className="w-6 h-6" />, title: 'Download CSV', desc: 'Get a clean, structured CSV instantly — compatible with Excel, QuickBooks & more.', accent: '#10b981' },
            ].map(({ step, icon, title, desc, accent }) => (
              <div key={step} className="relative flex flex-col items-center text-center">
                <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center mb-5 shadow-sm" style={{ backgroundColor: `${accent}18`, color: accent }}>
                  <div className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shadow" style={{ backgroundColor: accent }}>{step}</div>
                  {icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUPPORTED PROVIDERS ── */}
      <section id="providers" className="py-16 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Supported Mobile Networks</h2>
            <p className="text-slate-500">Full support for Africa's leading mobile money platforms</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* MTN Card */}
            <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200">
              <div className="px-8 py-7 flex items-center gap-5" style={{ backgroundColor: MTN_YELLOW }}>
                <div className="w-16 h-16 rounded-xl bg-black/10 flex items-center justify-center p-2">
                  <MTNLogo className="w-full h-auto" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">MTN Mobile Money</h3>
                  <p className="text-sm font-medium text-slate-700 opacity-80">MoMo · Uganda &amp; beyond</p>
                </div>
              </div>
              <div className="bg-white px-8 py-6">
                <ul className="space-y-3">
                  {['Send Money transactions', 'Receive Money transactions', 'Merchant payments', 'Withdraw & Deposit records', 'Airtime purchases', 'Opening & Closing balances'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-slate-700">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#b8960a' }} />{item}
                    </li>
                  ))}
                </ul>
                <button onClick={() => scrollToUpload('MTN')} className="mt-6 w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90" style={{ backgroundColor: MTN_YELLOW, color: '#1a1a1a' }}>
                  Convert MTN Statement <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* Airtel Card */}
            <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200">
              <div className="px-8 py-7 flex items-center gap-5" style={{ backgroundColor: AIRTEL_RED }}>
                <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center p-2.5">
                  <AirtelLogo className="w-full h-auto" invert={true} />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">Airtel Money</h3>
                  <p className="text-sm font-medium text-red-100">Airtel · Uganda &amp; beyond</p>
                </div>
              </div>
              <div className="bg-white px-8 py-6">
                <ul className="space-y-3">
                  {['Send Money transactions', 'Receive Money transactions', 'Bill payments', 'Withdraw & Deposit records', 'Airtime & data top-ups', 'Opening & Closing balances'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-slate-700">
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

<<<<<<< HEAD
      {/* ── FEATURES ── */}
      <section className="py-16 px-4 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Why MOAir?</h2>
            <p className="text-slate-500">Built specifically for African mobile money users</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Zap className="w-6 h-6" />, title: 'Instant Results', desc: 'Get your CSV in under 5 seconds. No waiting, no queues.', color: '#f59e0b', bg: '#fffbeb' },
              { icon: <Shield className="w-6 h-6" />, title: 'Zero Data Storage', desc: 'Your PDF is processed in memory and deleted immediately.', color: '#10b981', bg: '#ecfdf5' },
              { icon: <BarChart3 className="w-6 h-6" />, title: 'Accounting Ready', desc: 'Output CSV works with Excel, QuickBooks, Xero, Wave & more.', color: '#6366f1', bg: '#eef2ff' },
              { icon: <Globe2 className="w-6 h-6" />, title: 'African Networks', desc: 'Precision-tuned parsers for MTN MoMo & Airtel Money formats.', color: '#ef4444', bg: '#fef2f2' },
            ].map(({ icon, title, desc, color, bg }) => (
              <div key={title} className="rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: bg, color }}>{icon}</div>
                <h3 className="font-bold text-slate-900 mb-1.5">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
=======
        {/* Pricing Preview */}
        <div className="bg-gray-50 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Simple, Fair Pricing</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl">Free Tier</CardTitle>
                <p className="text-3xl font-bold">$0/month</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>✅ 5 conversions per month</p>
                <p>✅ MTN & Airtel support</p>
                <p>✅ Basic CSV format</p>
                <Link href="/convert">
                  <Button className="w-full mt-4">Get Started Free</Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="border-2 border-blue-500 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm">
                Most Popular
              </div>
              <CardHeader>
                <CardTitle className="text-xl">Pro</CardTitle>
                <p className="text-3xl font-bold">$25/month</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>✅ Unlimited conversions</p>
                <p>✅ Advanced categorization</p>
                <p>✅ Bulk upload</p>
                <p>✅ Custom CSV templates</p>
                <p>✅ Priority support</p>
                <Link href="/convert">
                  <Button className="w-full mt-4">Upgrade to Pro</Button>
                </Link>
              </CardContent>
            </Card>
>>>>>>> 4a7f9b142140b32ba8b3bc3ea0179a43cc88ee17
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-16 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Simple Pricing</h2>
            <p className="text-slate-500">No hidden fees. No credit card required to start.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-stretch">

            {/* Free */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Free</p>
              <p className="text-5xl font-extrabold text-slate-900 mb-1">$0</p>
              <p className="text-slate-500 text-sm mb-6">per month</p>
              <ul className="space-y-3 mb-8 flex-1">
                {['5 conversions / month', 'MTN & Airtel support', 'Standard CSV export', 'No sign-up required'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-700">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })} className="w-full py-3 rounded-xl font-bold text-slate-900 border-2 border-slate-900 hover:bg-slate-900 hover:text-white transition-all text-sm mt-auto">
                Get Started Free
              </button>
            </div>

            {/* Pro */}
            <div className="rounded-2xl p-8 shadow-lg relative overflow-hidden flex flex-col" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
              <div className="absolute top-5 right-5 text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: MTN_YELLOW, color: '#1a1a1a' }}>Most Popular</div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Pro</p>
              <p className="text-5xl font-extrabold text-white mb-1">$25</p>
              <p className="text-slate-400 text-sm mb-6">per month</p>
              <ul className="space-y-3 mb-8 flex-1">
                {['Unlimited conversions', 'MTN & Airtel support', 'Advanced categorization', 'Bulk PDF upload', 'Custom CSV templates', 'Priority support'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-white">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: MTN_YELLOW }} />{f}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 rounded-xl font-bold text-slate-900 transition-all hover:opacity-90 text-sm mt-auto" style={{ backgroundColor: MTN_YELLOW }}>
                Upgrade to Pro
              </button>
            </div>

            {/* Enterprise */}
            <div className="bg-white rounded-2xl border-2 border-slate-900 p-8 shadow-sm flex flex-col relative overflow-hidden">
              {/* Subtle diagonal accent */}
              <div className="absolute top-0 right-0 w-24 h-24 opacity-5"
                style={{ background: `linear-gradient(135deg, ${MTN_YELLOW}, ${AIRTEL_RED})`, borderRadius: '0 1rem 0 100%' }} />

              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Enterprise</p>
              <p className="text-5xl font-extrabold text-slate-900 mb-1">Custom</p>
              <p className="text-slate-500 text-sm mb-6">tailored to your needs</p>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  'Everything in Pro',
                  'Dedicated API access',
                  'White-label CSV output',
                  'SLA & uptime guarantee',
                  'Multi-user team access',
                  'Dedicated account manager',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-700">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 text-slate-900" />{f}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:hello@moair.app"
                className="w-full py-3 rounded-xl font-bold text-white text-sm text-center transition-all hover:opacity-90 mt-auto block"
                style={{ backgroundColor: AIRTEL_RED }}
              >
                Contact Us
              </a>
              <p className="text-center text-xs text-slate-400 mt-3">We&apos;ll respond within 24 hours</p>
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
              <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Terms of Use</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
