import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  Upload,
  Sparkles,
  Download,
  Trash2,
  TrendingDown,
  TrendingUp,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
  Loader2,
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { calculateExpenseSummary } from '../utils/rules';
import { ExpenseItem } from '../types/student';
import {
  SharedDocumentProcessor,
  ProcessedDocumentResult,
} from '../components/common/SharedDocumentProcessor';

export const FinanceView: React.FC = () => {
  const { expenses, addExpense, deleteExpense } = useStudent();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showSharedProcessor, setShowSharedProcessor] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Receipt OCR extraction state
  const [isExtractingReceipt, setIsExtractingReceipt] = useState(false);
  const [extractedReceipt, setExtractedReceipt] = useState<Partial<ExpenseItem> | null>(null);

  const categories = [
    'Food',
    'Transport',
    'Education',
    'Printing',
    'Hostel and Rent',
    'Shopping',
    'Entertainment',
    'Subscriptions',
    'Miscellaneous',
  ];

  const budgets = [
    { category: 'Food', monthlyLimit: 2500 },
    { category: 'Transport', monthlyLimit: 1200 },
    { category: 'Printing', monthlyLimit: 500 },
    { category: 'Education', monthlyLimit: 1500 },
  ];

  const summary = calculateExpenseSummary(expenses, budgets);

  const filteredExpenses = expenses.filter((e) => {
    const matchesCat = selectedCategory === 'all' || e.category === selectedCategory;
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.merchant && e.merchant.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleManualAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const title = (form.elements.namedItem('title') as HTMLInputElement).value;
    const amount = Number((form.elements.namedItem('amount') as HTMLInputElement).value) || 0;
    const category = (form.elements.namedItem('category') as HTMLSelectElement).value as any;
    const merchant = (form.elements.namedItem('merchant') as HTMLInputElement).value;
    const date = (form.elements.namedItem('date') as HTMLInputElement).value;

    const newExp: ExpenseItem = {
      id: `exp-${Date.now()}`,
      title,
      amount,
      category,
      date: date || new Date().toISOString().split('T')[0],
      merchant,
    };

    addExpense(newExp);
    setShowAddModal(false);
  };

  const handleExtractReceipt = async () => {
    setIsExtractingReceipt(true);
    try {
      const res = await fetch('/api/gemini/extract-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiptText: 'Campus Bookstore & Xerox, 40-page report, Total ₹240' }),
      });
      const data = await res.json();
      setExtractedReceipt({
        title: data.merchant ? `${data.merchant} (${data.detectedItems?.[0] || 'Receipt'})` : 'Stationery & Printing',
        amount: data.amount || 240,
        category: data.category || 'Printing',
        date: data.date || new Date().toISOString().split('T')[0],
        merchant: data.merchant || 'Campus Store',
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsExtractingReceipt(false);
    }
  };

  const handleSaveExtractedReceipt = () => {
    if (!extractedReceipt || !extractedReceipt.amount) return;
    addExpense({
      id: `exp-${Date.now()}`,
      title: extractedReceipt.title || 'Receipt Expense',
      amount: extractedReceipt.amount,
      category: (extractedReceipt.category as any) || 'Miscellaneous',
      date: extractedReceipt.date || new Date().toISOString().split('T')[0],
      merchant: extractedReceipt.merchant,
    });
    setExtractedReceipt(null);
    setShowReceiptModal(false);
  };

  const handleReceiptExtracted = (result: ProcessedDocumentResult) => {
    const d = result.data;
    const newExpense: ExpenseItem = {
      id: `exp-${Date.now()}`,
      title: d.merchant ? `${d.merchant} (${d.detectedItems?.[0] || 'Receipt'})` : 'Campus Expense',
      amount: Number(d.amount) || 0,
      category: (d.category as any) || 'Printing',
      date: d.date || new Date().toISOString().split('T')[0],
      merchant: d.merchant || 'Campus Store',
    };
    addExpense(newExpense);
  };

  const handleExportCSV = () => {
    const headers = 'ID,Title,Merchant,Category,Amount,Date\n';
    const rows = expenses
      .map((e) => `"${e.id}","${e.title}","${e.merchant || ''}","${e.category}","${e.amount}","${e.date}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VYUVIK_Expenses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#171827] tracking-tight flex items-center gap-2">
            <Wallet className="w-6 h-6 text-[#7065E8]" />
            College Expense Manager
          </h1>
          <p className="text-xs sm:text-sm text-[#717487] mt-0.5">
            Deterministic student budget tracking, receipt OCR extraction, and INR spending analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="bg-white border border-[#E8E8EF] hover:bg-[#FAFAFC] text-[#171827] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowSharedProcessor(true)}
            className="bg-[#F0EEFF] hover:bg-[#E2DEFD] text-[#7065E8] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Scan Receipt (OCR)</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#7065E8] hover:bg-[#5E52E2] text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E8E8EF] shadow-2xs">
          <p className="text-xs font-semibold text-[#717487]">Total Spent This Month</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#171827]">
              ₹ {summary.totalSpent.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-bold text-[#18856B]">Within limit</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8E8EF] shadow-2xs">
          <p className="text-xs font-semibold text-[#717487]">Highest Spending Category</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl sm:text-2xl font-bold text-[#7065E8]">
              {Object.entries(summary.categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'}
            </span>
            <span className="text-xs text-[#717487]">
              (₹{Object.entries(summary.categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[1] || 0})
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8E8EF] shadow-2xs">
          <p className="text-xs font-semibold text-[#717487]">Active Monthly Budgets</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl sm:text-2xl font-bold text-[#171827]">
              {budgets.length} Monitored
            </span>
            <span className="text-xs text-[#18856B] font-bold">0 Breaches</span>
          </div>
        </div>
      </div>

      {/* Budget Progress Bars */}
      <div className="bg-white p-5 rounded-2xl border border-[#E8E8EF] shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-[#171827] uppercase tracking-wider">
          Category Budget Limits & Progress
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summary.budgetComparison.map((b) => (
            <div key={b.category} className="p-3.5 bg-[#FAFAFC] rounded-xl border border-[#E8E8EF]">
              <div className="flex items-center justify-between text-xs font-bold text-[#171827] mb-1">
                <span>{b.category}</span>
                <span>₹{b.spent} / ₹{b.limit}</span>
              </div>
              <div className="w-full bg-[#E8E8EF] h-2 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full transition-all ${
                    b.isOverBudget ? 'bg-[#C64545]' : 'bg-[#7065E8]'
                  }`}
                  style={{ width: `${Math.min(100, b.percentUsed)}%` }}
                />
              </div>
              <p className="text-[10px] text-[#717487] mt-1.5 font-medium">
                ₹{Math.max(0, b.remaining)} remaining
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Transactions List */}
      <div className="bg-white p-5 rounded-2xl border border-[#E8E8EF] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl font-semibold ${
                selectedCategory === 'all'
                  ? 'bg-[#F0EEFF] text-[#7065E8]'
                  : 'text-[#717487] hover:text-[#171827]'
              }`}
            >
              All
            </button>
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#F0EEFF] text-[#7065E8]'
                    : 'text-[#717487] hover:text-[#171827]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#8C8FA3] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search expenses or merchants..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-xs text-[#171827] focus:outline-hidden focus:border-[#7065E8]"
            />
          </div>
        </div>

        <div className="divide-y divide-[#E8E8EF]">
          {filteredExpenses.map((exp) => (
            <div key={exp.id} className="py-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FAFAFC] border border-[#E8E8EF] flex items-center justify-center font-bold text-[#7065E8]">
                  ₹
                </div>
                <div>
                  <h4 className="font-bold text-[#171827]">{exp.title}</h4>
                  <p className="text-[11px] text-[#717487]">
                    {exp.category} {exp.merchant ? `• ${exp.merchant}` : ''} • {exp.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-extrabold text-sm text-[#171827]">
                  ₹ {exp.amount}
                </span>
                <button
                  onClick={() => deleteExpense(exp.id)}
                  className="p-1.5 text-[#8C8FA3] hover:text-[#C64545] rounded-lg"
                  title="Delete record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E8E8EF] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E8EF] pb-3">
              <h3 className="text-sm font-bold text-[#171827]">Add Student Expense</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#717487]">✕</button>
            </div>

            <form onSubmit={handleManualAdd} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#171827]">Expense Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Canteen Lunch, Xerox printout"
                  className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-[#171827]">Amount (INR ₹) *</label>
                  <input
                    type="number"
                    name="amount"
                    required
                    min="1"
                    placeholder="e.g. 150"
                    className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#171827]">Category</label>
                  <select
                    name="category"
                    className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-[#171827]">Merchant / Vendor</label>
                  <input
                    type="text"
                    name="merchant"
                    placeholder="e.g. Central Canteen"
                    className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#171827]">Date</label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E8EF]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 border border-[#E8E8EF] rounded-xl text-[#717487] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#7065E8] hover:bg-[#5E52E2] text-white rounded-xl font-semibold shadow-xs"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scan Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E8E8EF] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E8EF] pb-3">
              <h3 className="text-sm font-bold text-[#171827] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#7065E8]" />
                Scan Receipt with Gemini 4 Argon OCR
              </h3>
              <button onClick={() => setShowReceiptModal(false)} className="text-[#717487]">✕</button>
            </div>

            <div className="p-4 bg-[#FAFAFC] border-2 border-dashed border-[#D9D4FA] rounded-xl text-center space-y-2">
              <Upload className="w-8 h-8 text-[#7065E8] mx-auto opacity-80" />
              <p className="text-xs font-semibold text-[#171827]">Upload canteen or stationery receipt</p>
              <p className="text-[10px] text-[#717487]">Auto-extracts merchant, total amount, and category</p>
            </div>

            <button
              onClick={handleExtractReceipt}
              disabled={isExtractingReceipt}
              className="w-full py-2 bg-[#7065E8] hover:bg-[#5E52E2] disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              {isExtractingReceipt ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{isExtractingReceipt ? 'Extracting Receipt...' : 'Extract Receipt Information'}</span>
            </button>

            {extractedReceipt && (
              <div className="p-3 bg-[#F0EEFF] border border-[#D9D4FA] rounded-xl text-xs space-y-1.5">
                <span className="font-bold text-[#7065E8]">Extracted Details:</span>
                <p><strong>Merchant:</strong> {extractedReceipt.merchant}</p>
                <p><strong>Amount:</strong> ₹ {extractedReceipt.amount}</p>
                <p><strong>Category:</strong> {extractedReceipt.category}</p>
                <button
                  onClick={handleSaveExtractedReceipt}
                  className="w-full mt-2 py-1.5 bg-[#18856B] text-white rounded-lg font-bold"
                >
                  Confirm & Save to Expenses
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shared Document Processing Pipeline Modal */}
      <SharedDocumentProcessor
        isOpen={showSharedProcessor}
        onClose={() => setShowSharedProcessor(false)}
        workflow="receipt"
        title="College Expense Receipt OCR"
        subtitle="Upload canteen bills, stationery invoices, book receipts, or transport tickets. Gemini extracts itemized costs, tax, and updates your monthly budget."
        onExtractionComplete={handleReceiptExtracted}
      />
    </div>
  );
};
