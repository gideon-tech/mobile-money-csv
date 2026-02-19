import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import FileUploadZone from '@/components/FileUploadZone';

export default function ConverterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Convert Mobile Money Statement</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instructions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">How to Convert Your Statement</h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600">1</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Upload PDF</h3>
                <p className="text-gray-600">Drop your MTN Mobile Money or Airtel Money PDF statement</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-green-600">2</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Auto Processing</h3>
                <p className="text-gray-600">We automatically detect and parse your transactions</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-purple-600">3</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Download CSV</h3>
                <p className="text-gray-600">Get clean data ready for Excel or accounting software</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Zone */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <FileUploadZone 
            onFileUploaded={(uploadId) => {
              console.log('File uploaded successfully:', uploadId);
            }}
            maxFileSize={10 * 1024 * 1024} // 10MB
          />
        </div>

        {/* Supported Formats */}
        <div className="mt-8 bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">Supported Statement Formats</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">📱 MTN Mobile Money</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• PDF statements from MTN Uganda</li>
                <li>• Send/Receive transactions</li>
                <li>• Cash in/Cash out records</li>
                <li>• Bill payments & airtime purchases</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">📱 Airtel Money</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• PDF statements from Airtel Uganda</li>
                <li>• Transfer & receive transactions</li>
                <li>• Cash deposits & withdrawals</li>
                <li>• Merchant payments & utilities</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-green-50 rounded-lg border border-green-200 p-4">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5">
              🔒
            </div>
            <div>
              <h4 className="font-medium text-green-800 mb-1">Your Data is Secure</h4>
              <p className="text-sm text-green-700">
                Files are processed securely and automatically deleted after 1 hour. 
                We never store your financial data permanently.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}