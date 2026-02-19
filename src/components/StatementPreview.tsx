'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Eye, FileText, TrendingUp, TrendingDown } from 'lucide-react';

interface Transaction {
  date: string;
  time: string;
  type: 'Send' | 'Receive' | 'Withdraw' | 'Deposit' | 'Pay Bill' | 'Buy Airtime' | 'Other';
  description: string;
  amount: number;
  balance: number;
  counterParty?: string;
  reference: string;
  provider: 'MTN' | 'Airtel';
}

interface PreviewData {
  uploadId: string;
  provider: 'MTN' | 'Airtel';
  accountNumber: string;
  period: {
    from: string;
    to: string;
  };
  totalTransactions: number;
  previewTransactions: Transaction[];
  hasMore: boolean;
}

interface Summary {
  provider: 'MTN' | 'Airtel';
  period: {
    from: string;
    to: string;
  };
  totalTransactions: number;
  openingBalance: number;
  closingBalance: number;
  sent: { count: number; total: number };
  received: { count: number; total: number };
  withdrawals: { count: number; total: number };
  deposits: { count: number; total: number };
  bills: { count: number; total: number };
  airtime: { count: number; total: number };
}

interface StatementPreviewProps {
  uploadId: string;
  onClose?: () => void;
}

export default function StatementPreview({ uploadId, onClose }: StatementPreviewProps) {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'summary'>('preview');

  useEffect(() => {
    fetchPreviewData();
    fetchSummaryData();
  }, [uploadId]);

  const fetchPreviewData = async () => {
    try {
      const response = await fetch(`/api/process/${uploadId}?format=preview`);
      if (!response.ok) {
        throw new Error(`Failed to fetch preview: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success) {
        setPreviewData(data);
      } else {
        setError(data.error || 'Failed to load preview');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preview');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummaryData = async () => {
    try {
      const response = await fetch(`/api/process/${uploadId}?format=summary`);
      if (!response.ok) {
        throw new Error(`Failed to fetch summary: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success) {
        setSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to load summary:', err);
    }
  };

  const downloadCSV = () => {
    const link = document.createElement('a');
    link.href = `/api/download/${uploadId}?format=csv`;
    link.download = `mobile-money-statement-${uploadId}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadSummary = () => {
    const link = document.createElement('a');
    link.href = `/api/download/${uploadId}?format=summary`;
    link.download = `mobile-money-summary-${uploadId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600">Loading preview...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-4">{error}</div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>
    );
  }

  if (!previewData) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-600">No data available</div>
      </div>
    );
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'Send':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'Receive':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      case 'Withdraw':
        return <TrendingUp className="w-4 h-4 text-orange-500" />;
      case 'Deposit':
        return <TrendingDown className="w-4 h-4 text-blue-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Statement Preview</h2>
            <p className="text-sm text-gray-600 mt-1">
              {previewData.provider} Mobile Money • {previewData.accountNumber}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={downloadSummary}>
              Download Summary
            </Button>
            <Button onClick={downloadCSV}>
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mt-4 border-b">
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'preview'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('preview')}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            Preview ({previewData.previewTransactions.length} transactions)
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'summary'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('summary')}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Summary
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'preview' && (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Amount</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.previewTransactions.map((transaction, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <div className="text-gray-900">{transaction.date}</div>
                        <div className="text-xs text-gray-500">{transaction.time}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(transaction.type)}
                          <span className="text-gray-700">{transaction.type}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-gray-900 max-w-xs truncate" title={transaction.description}>
                          {transaction.description}
                        </div>
                        {transaction.reference && (
                          <div className="text-xs text-gray-500">Ref: {transaction.reference}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-medium ${
                          transaction.type === 'Receive' || transaction.type === 'Deposit'
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {formatAmount(transaction.amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        {formatAmount(transaction.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {previewData.hasMore && (
              <div className="mt-4 p-3 bg-blue-50 rounded text-center">
                <p className="text-sm text-blue-700">
                  Showing first 10 transactions. Download CSV to see all {previewData.totalTransactions} transactions.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'summary' && summary && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Account Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Provider:</span>
                    <span className="font-medium">{summary.provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Period:</span>
                    <span className="font-medium">{summary.period.from} to {summary.period.to}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Transactions:</span>
                    <span className="font-medium">{summary.totalTransactions}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Balance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Opening:</span>
                    <span className="font-medium">{formatAmount(summary.openingBalance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Closing:</span>
                    <span className="font-medium">{formatAmount(summary.closingBalance)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600">Net Change:</span>
                    <span className={`font-medium ${
                      summary.closingBalance >= summary.openingBalance
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {formatAmount(summary.closingBalance - summary.openingBalance)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Money Flow</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-gray-600">Money Sent</div>
                      <div className="text-xs text-gray-500">{summary.sent.count} transactions</div>
                    </div>
                    <span className="font-medium text-red-600">{formatAmount(summary.sent.total)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-gray-600">Money Received</div>
                      <div className="text-xs text-gray-500">{summary.received.count} transactions</div>
                    </div>
                    <span className="font-medium text-green-600">{formatAmount(summary.received.total)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-gray-600">Cash Withdrawals</div>
                      <div className="text-xs text-gray-500">{summary.withdrawals.count} transactions</div>
                    </div>
                    <span className="font-medium text-red-600">{formatAmount(summary.withdrawals.total)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-gray-600">Cash Deposits</div>
                      <div className="text-xs text-gray-500">{summary.deposits.count} transactions</div>
                    </div>
                    <span className="font-medium text-green-600">{formatAmount(summary.deposits.total)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Other Transactions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-gray-600">Bill Payments</div>
                      <div className="text-xs text-gray-500">{summary.bills.count} transactions</div>
                    </div>
                    <span className="font-medium">{formatAmount(summary.bills.total)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-gray-600">Airtime Purchases</div>
                      <div className="text-xs text-gray-500">{summary.airtime.count} transactions</div>
                    </div>
                    <span className="font-medium">{formatAmount(summary.airtime.total)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}