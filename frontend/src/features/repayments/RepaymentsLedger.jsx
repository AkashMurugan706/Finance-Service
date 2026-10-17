import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  CreditCard,
  DollarSign,
  Printer,
  Sparkles,
  ArrowRight,
  TrendingDown,
  User,
} from 'lucide-react';
import { BRAND_CONFIG, formatCurrency, formatDate } from '../../config/brandConfig';
import paymentService from '../../services/paymentService';
import loanService from '../../services/loanService';
import {
  Button,
  Input,
  Select,
  Badge,
  Card,
  Modal,
  TableSkeleton,
  ErrorBanner,
} from '../../components/common';

export const RepaymentsLedger = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('ALL');

  // Record Payment Modal State
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [activeLoans, setActiveLoans] = useState([]);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [recordingPayment, setRecordingPayment] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    loanId: '',
    amountPaid: 5000,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentType: 'UPI',
    transactionReference: '',
    autoAllocate: true,
    interestPortion: 0,
    principalPortion: 0,
    penaltyPortion: 0,
    notes: 'Regular monthly installment',
  });

  // Selected Loan Context for Calculation
  const [selectedLoan, setSelectedLoan] = useState(null);

  // View Receipt Modal
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, [paymentTypeFilter]);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      const data = await paymentService.getPayments(filters);
      setPayments(data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const openRecordModal = async () => {
    setIsRecordModalOpen(true);
    setLoadingLoans(true);
    try {
      const loans = await loanService.getLoans({ status: 'ACTIVE' });
      setActiveLoans(loans || []);
      if (loans && loans.length > 0) {
        setPaymentForm((prev) => ({ ...prev, loanId: loans[0].id }));
        loadLoanDetails(loans[0].id);
      }
    } catch (err) {
      console.warn('Error loading active loans:', err);
    } finally {
      setLoadingLoans(false);
    }
  };

  const loadLoanDetails = async (loanId) => {
    try {
      const loan = await loanService.getLoanById(loanId);
      setSelectedLoan(loan);
      // Auto-suggest reasonable installment amount (monthly interest or outstanding)
      if (loan) {
        const suggestedAmount = Math.max(Number(loan.monthlyInterestAmount || 2000), 1000);
        setPaymentForm((prev) => ({
          ...prev,
          amountPaid: suggestedAmount,
        }));
      }
    } catch (err) {
      console.warn('Error loading loan details:', err);
    }
  };

  const handleLoanChange = (e) => {
    const loanId = e.target.value;
    setPaymentForm((prev) => ({ ...prev, loanId }));
    if (loanId) {
      loadLoanDetails(loanId);
    } else {
      setSelectedLoan(null);
    }
  };

  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    if (!paymentForm.loanId || !paymentForm.amountPaid) {
      alert('Please select a loan and enter repayment amount.');
      return;
    }

    try {
      setRecordingPayment(true);
      const res = await paymentService.recordPayment({
        loanId: Number(paymentForm.loanId),
        amountPaid: Number(paymentForm.amountPaid),
        paymentDate: paymentForm.paymentDate,
        paymentType: paymentForm.paymentType,
        transactionReference: paymentForm.transactionReference || `TXN-${Date.now().toString().slice(-8)}`,
        autoAllocate: paymentForm.autoAllocate,
        interestPortion: paymentForm.autoAllocate ? null : Number(paymentForm.interestPortion || 0),
        principalPortion: paymentForm.autoAllocate ? null : Number(paymentForm.principalPortion || 0),
        notes: paymentForm.notes,
        recordedBy: 'SMS Cashier',
      });

      setIsRecordModalOpen(false);
      fetchPayments();
      // Show official receipt modal
      setReceiptData(res);
    } catch (err) {
      alert(err.message || 'Failed to record repayment');
    } finally {
      setRecordingPayment(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      (p.receiptNumber?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.customerName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.loanNumber?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.transactionReference?.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType =
      paymentTypeFilter === 'ALL' || p.paymentType === paymentTypeFilter;

    return matchesSearch && matchesType;
  });

  const totalCollected = filteredPayments.reduce(
    (acc, curr) => acc + (Number(curr.amountPaid) || 0),
    0
  );

  const totalInterestCollected = filteredPayments.reduce(
    (acc, curr) => acc + (Number(curr.interestPortion) || 0),
    0
  );

  const totalPrincipalCollected = filteredPayments.reduce(
    (acc, curr) => acc + (Number(curr.principalPortion) || 0),
    0
  );

  // Projected allocation for modal preview
  const enteredAmount = Number(paymentForm.amountPaid) || 0;
  const accruedInt = Number(selectedLoan?.accruedInterestToDate || selectedLoan?.monthlyInterestAmount || 0);
  const projectedInterestPaid = Math.min(enteredAmount, accruedInt);
  const projectedPrincipalPaid = Math.max(0, enteredAmount - projectedInterestPaid);
  const projectedRemainingPrincipal = Math.max(
    0,
    (Number(selectedLoan?.remainingPrincipal || 0) - projectedPrincipalPaid)
  );

  return (
    <div className="space-y-6">
      {/* Header and Quick Stats */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-emerald-400" />
            Repayments & Collections Ledger
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time receipt tracking, Vatti interest allocation, and principal balance amortization
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="emerald"
            icon={Plus}
            onClick={openRecordModal}
          >
            Record Repayment
          </Button>
        </div>
      </div>

      {/* Aggregate Revenue Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/70 border border-emerald-500/30 rounded-2xl p-4 backdrop-blur-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Total Collections
            </span>
            <div className="text-xl font-bold font-mono text-emerald-400">
              {formatCurrency(totalCollected)}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-indigo-500/30 rounded-2xl p-4 backdrop-blur-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Vatti Interest Earned
            </span>
            <div className="text-xl font-bold font-mono text-indigo-300">
              {formatCurrency(totalInterestCollected)}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 backdrop-blur-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Principal Recovered
            </span>
            <div className="text-xl font-bold font-mono text-white">
              {formatCurrency(totalPrincipalCollected)}
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <ErrorBanner
          error={error}
          onRetry={fetchPayments}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Search and Filters */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search by receipt #, customer, loan #..."
            prefix={<Search className="w-4 h-4 text-slate-500" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'UPI', 'CASH', 'BANK_TRANSFER', 'CHEQUE'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setPaymentTypeFilter(type)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors shrink-0 ${
                paymentTypeFilter === type
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <Card
        title="Payment Transactions Ledger"
        subtitle={`Showing ${filteredPayments.length} recorded payments`}
        icon={Receipt}
      >
        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-3">
            <Receipt className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-sm">No payment records found.</p>
            <Button variant="outline" size="sm" onClick={openRecordModal}>
              Record First Repayment
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pl-2">Receipt & Date</th>
                  <th className="pb-3">Borrower & Loan</th>
                  <th className="pb-3 text-right">Amount Paid</th>
                  <th className="pb-3 text-right">Allocation (Interest / Principal)</th>
                  <th className="pb-3 text-right">Balance After</th>
                  <th className="pb-3 text-center">Mode</th>
                  <th className="pb-3 pr-2 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPayments.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3.5 pl-2">
                      <div className="font-mono font-bold text-white text-xs">
                        #{p.receiptNumber}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {formatDate(p.paymentDate)}
                      </div>
                    </td>

                    <td className="py-3.5">
                      <div className="font-semibold text-slate-200">
                        {p.customerName || 'Borrower'}
                      </div>
                      <div className="text-[11px] font-mono text-indigo-400 mt-0.5">
                        Loan #{p.loanNumber}
                      </div>
                    </td>

                    <td className="py-3.5 text-right font-mono font-extrabold text-emerald-400 text-sm">
                      {formatCurrency(p.amountPaid)}
                    </td>

                    <td className="py-3.5 text-right font-mono text-[11px]">
                      <span className="text-indigo-300 font-medium">
                        Int: {formatCurrency(p.interestPortion)}
                      </span>
                      <span className="text-slate-500 mx-1.5">|</span>
                      <span className="text-cyan-300 font-medium">
                        Prin: {formatCurrency(p.principalPortion)}
                      </span>
                    </td>

                    <td className="py-3.5 text-right font-mono font-bold text-slate-300">
                      {formatCurrency(p.principalBalanceAfter)}
                    </td>

                    <td className="py-3.5 text-center">
                      <Badge variant={p.paymentType} />
                    </td>

                    <td className="py-3.5 pr-2 text-right">
                      <button
                        type="button"
                        onClick={() => setReceiptData(p)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="View Official Receipt"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* RECORD REPAYMENT MODAL */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Loan Repayment"
        subtitle="Collect installment and auto-allocate between accrued Vatti and principal"
        icon={Receipt}
        maxWidth="lg"
      >
        <form onSubmit={handleRecordSubmit} className="space-y-4">
          <div className="space-y-3">
            <Select
              label="Select Active Loan Account *"
              value={paymentForm.loanId}
              onChange={handleLoanChange}
              helperText="Only active loans with outstanding balance"
            >
              {activeLoans.map((l) => (
                <option key={l.id} value={l.id}>
                  Loan #{l.loanNumber} - {l.customerName} (Bal: {formatCurrency(l.remainingPrincipal, false)})
                </option>
              ))}
              {activeLoans.length === 0 && (
                <option value="">No active loans found</option>
              )}
            </Select>

            {selectedLoan && (
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-indigo-500/30 text-xs space-y-2">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-slate-400">Borrower:</span>
                  <span className="text-white">{selectedLoan.customerName} ({selectedLoan.customerPhone})</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-400">Current Remaining Principal:</span>
                  <span className="text-white font-bold">{formatCurrency(selectedLoan.remainingPrincipal)}</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-400">Monthly Vatti Due:</span>
                  <span className="text-indigo-300 font-bold">{formatCurrency(selectedLoan.monthlyInterestAmount)} / month</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Repayment Amount (₹) *"
                type="number"
                prefix={BRAND_CONFIG.currencySymbol}
                value={paymentForm.amountPaid}
                onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: e.target.value })}
              />

              <Input
                label="Payment Date"
                type="date"
                value={paymentForm.paymentDate}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
              />

              <Select
                label="Payment Method"
                value={paymentForm.paymentType}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentType: e.target.value })}
              >
                <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                <option value="CASH">Cash in Hand</option>
                <option value="BANK_TRANSFER">NEFT / RTGS Bank Transfer</option>
                <option value="CHEQUE">Bank Cheque</option>
              </Select>

              <Input
                label="Transaction Reference / Cheque #"
                placeholder="e.g. UPI/123456789 or CHQ-9812"
                value={paymentForm.transactionReference}
                onChange={(e) => setPaymentForm({ ...paymentForm, transactionReference: e.target.value })}
              />
            </div>

            {/* Auto Allocate Switch & Projected Breakdown */}
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">
                    Auto-Allocate Accrued Vatti Interest
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Settles accrued interest first, then amortizes remaining principal
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentForm.autoAllocate}
                    onChange={(e) => setPaymentForm({ ...paymentForm, autoAllocate: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {selectedLoan && (
                <div className="pt-2 border-t border-slate-800/80 text-[11px] space-y-1 font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Projected Interest Allocated:</span>
                    <span className="text-indigo-300 font-bold">{formatCurrency(projectedInterestPaid)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Projected Principal Amortized:</span>
                    <span className="text-cyan-300 font-bold">{formatCurrency(projectedPrincipalPaid)}</span>
                  </div>
                  <div className="flex justify-between text-white pt-1 border-t border-slate-800">
                    <span>New Outstanding Principal:</span>
                    <span className="text-emerald-400 font-bold">{formatCurrency(projectedRemainingPrincipal)}</span>
                  </div>
                  {projectedRemainingPrincipal === 0 && (
                    <div className="text-emerald-400 font-sans text-xs pt-1 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      This repayment fully clears the principal balance! Loan will automatically transition to CLOSED.
                    </div>
                  )}
                </div>
              )}
            </div>

            <Input
              label="Notes"
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              variant="secondary"
              onClick={() => setIsRecordModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="emerald"
              type="submit"
              loading={recordingPayment}
              disabled={!paymentForm.loanId || !paymentForm.amountPaid}
            >
              Confirm & Issue Receipt
            </Button>
          </div>
        </form>
      </Modal>

      {/* VIEW OFFICIAL RECEIPT MODAL */}
      <Modal
        isOpen={Boolean(receiptData)}
        onClose={() => setReceiptData(null)}
        title="Official Repayment Receipt"
        subtitle={BRAND_CONFIG.brandName}
        icon={Receipt}
        maxWidth="md"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="secondary"
              size="sm"
              icon={Printer}
              onClick={() => window.print()}
            >
              Print Receipt
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setReceiptData(null)}
            >
              Done
            </Button>
          </div>
        }
      >
        {receiptData && (
          <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-4">
            {/* Receipt Header */}
            <div className="text-center pb-4 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white tracking-tight">
                {BRAND_CONFIG.brandName}
              </h3>
              <p className="text-[11px] text-slate-400">{BRAND_CONFIG.tagline}</p>
              <div className="mt-2 inline-block px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono text-[11px]">
                Receipt #{receiptData.receiptNumber}
              </div>
            </div>

            {/* Receipt Key-Values */}
            <div className="space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Date:</span>
                <span className="text-white font-medium">{formatDate(receiptData.paymentDate)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Borrower:</span>
                <span className="text-white font-bold">{receiptData.customerName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Loan Account:</span>
                <span className="font-mono text-indigo-300">#{receiptData.loanNumber}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Payment Mode:</span>
                <span className="font-mono text-white">{receiptData.paymentType}</span>
              </div>
              {receiptData.transactionReference && (
                <div className="flex justify-between text-slate-400">
                  <span>Txn Ref:</span>
                  <span className="font-mono text-slate-300">{receiptData.transactionReference}</span>
                </div>
              )}
            </div>

            {/* Financial Breakdown Table */}
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Total Amount Paid:</span>
                <span className="text-emerald-400 font-extrabold text-sm">{formatCurrency(receiptData.amountPaid)}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>- Vatti Interest Portion:</span>
                <span className="text-indigo-300">{formatCurrency(receiptData.interestPortion)}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>- Principal Repaid:</span>
                <span className="text-cyan-300">{formatCurrency(receiptData.principalPortion)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-white font-bold text-xs">
                <span>Remaining Principal Balance:</span>
                <span>{formatCurrency(receiptData.principalBalanceAfter)}</span>
              </div>
            </div>

            <div className="text-[10px] text-center text-slate-500 italic">
              Thank you for community lending with SMS Finance Service. Computer generated receipt.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RepaymentsLedger;
