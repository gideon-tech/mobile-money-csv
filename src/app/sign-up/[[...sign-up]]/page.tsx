import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';
import { FileText } from 'lucide-react';

const MTN_YELLOW = '#FFCB05';
const AIRTEL_RED = '#E40000';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Minimal navbar */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex flex-shrink-0">
              <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: MTN_YELLOW }}>
                <FileText className="w-3 h-3" style={{ color: '#1a1a1a' }} />
              </div>
              <div className="flex-1" style={{ backgroundColor: AIRTEL_RED }} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">MOAir</span>
          </Link>
        </div>
      </header>

      {/* Centered auth card */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
            <p className="text-slate-500 mt-1 text-sm">Start converting statements for free</p>
          </div>
          <SignUp
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-xl border border-slate-200 rounded-2xl',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton: 'border border-slate-200 hover:bg-slate-50',
                formButtonPrimary: 'font-bold',
              },
              variables: {
                colorPrimary: '#1e293b',
                borderRadius: '0.75rem',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
