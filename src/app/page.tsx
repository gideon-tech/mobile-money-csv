import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Shield, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">MoMo2CSV</span>
            </div>
            <nav className="flex space-x-4">
              <Button variant="ghost">How it Works</Button>
              <Button variant="ghost">Pricing</Button>
              <Button variant="outline">Sign In</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Convert Mobile Money Statements to <span className="text-blue-600">CSV</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your MTN Mobile Money and Airtel Money statements into clean, organized CSV files 
            ready for Excel, QuickBooks, or any accounting software.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" className="text-lg px-8 py-3">
              Try Free (5 conversions)
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3">
              View Demo
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader className="text-center">
              <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Lightning Fast</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Upload your PDF statement and get a clean CSV in seconds. 
                No manual data entry required.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Secure & Private</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Your financial data is processed securely and never stored. 
                Files are deleted immediately after conversion.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Download className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Ready for Import</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                CSV format works with Excel, QuickBooks, Xero, and all 
                major accounting software.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How it Works */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Upload Statement</h3>
              <p className="text-gray-600">Drop your MTN or Airtel PDF statement</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Auto Processing</h3>
              <p className="text-gray-600">Our AI extracts and categorizes transactions</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Download CSV</h3>
              <p className="text-gray-600">Get clean, organized data ready for import</p>
            </div>
          </div>
        </div>

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
                <Button className="w-full mt-4">Get Started Free</Button>
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
                <Button className="w-full mt-4">Upgrade to Pro</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}