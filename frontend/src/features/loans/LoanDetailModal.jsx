import React, { useState } from 'react';
import {
  FileText,
  DollarSign,
  Calendar,
  Clock,
  Shield,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  CreditCard,
  Receipt,
  XCircle,
} from 'lucide-react';
import { BRAND_CONFIG, formatCurrency, formatDate } from '../../config/brandConfig';
import loanService from '../../services/loanService';
import paymentService from '../../services/paymentService';
import { Modal, Button, Badge, Input, Select, ErrorBanner } from '../../components/common';

export const LoanDetailModal = ({
  loan,
  isOpen,
  onClose,
  onLoanUpdated,
}) => {
  const [closing, setClosing] = useState(false);
  const [payingOff, setPayingOff] = useState(false);
  const [closeNotes, setCloseNotes] = useState('Full settlement completed.');
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showPayoffConfirm, setShowPayoffConfirm] = useState(false);
  const [error, setError] = useState(null);

  // Payoff form state
  const [payoffPaymentType, setPayoffPaymentType] = useState('CASH');
  const [payoffReference, setPayoffReference] = useState('');

  if (!loan) return null;

  const remainingPrincipalNum = Number(loan.remainingPrincipal || 0);
  const accruedInterestNum = Number(loan.accruedInterestToDate || 0);
  const payoffTotal = Number(loan.totalEstimatedOutstanding || (remainingPrincipalNum + accruedInterestNum));
  const hasOutstandingBalance = remainingPrincipalNum > 0;

  // Administrative close (only works when remaining principal is 0)
  const handleCloseLoan = async () => {
    try {
      setClosing(true);
      setError(null);
      const updated = await loanService.closeLoan(loan.id, closeNotes);
      setShowCloseConfirm(false);
      if (onLoanUpdated) {
        onLoanUpdated(updated);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Cannot close loan. Principal balance must be fully settled first.');
    } finally {
      setClosing(false);
    }
  };

  // Full Payoff settlement (clears balance and automatically closes loan)
  const handlePayoffAndClose = async () => {
    try {
      setPayingOff(true);
      setError(null);

      // Record full payoff repayment
      await paymentService.recordPayment({
        loanId: loan.id,
        amountPaid: payoffTotal,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentType: payoffPaymentType,
        transactionReference: payoffReference || `PAYOFF-${Date.now().toString().slice(-6)}`,
        autoAllocate: true,
        notes: `Full loan settlement and closure: ${closeNotes}`,
        recordedBy: 'SMS Finance Manager',
      });

      setShowPayoffConfirm(false);
      if (onLoanUpdated) {
        onLoanUpdated({ ...loan, loanStatus: 'CLOSED', remainingPrincipal: 0 });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to process payoff repayment.');
    } finally {
      setPayingOff(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Loan Account #${loan.loanNumber}`}
      subtitle={`Borrower: ${loan.customerName || 'Community Member'} (${loan.customerPhone || 'N/A'})`}
      icon={FileText}
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          {loan.loanStatus === 'ACTIVE' && (
            <div>
              {hasOutstandingBalance ? (
                <Button
                  variant="emerald"
                  size="sm"
                  icon={Receipt}
                  onClick={() => {
                    setError(null);
                    setShowPayoffConfirm(true);
                  }}
                >
                  Payoff & Close ({formatCurrency(payoffTotal)})
                </Button>
              ) : (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setError(null);
                    setShowCloseConfirm(true);
                  }}
                >
                  Close Loan Account
                </Button>
              )}
            </div>
          )}
          <div className="ml-auto">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Error Alert if action fails */}
        {error && (
          <ErrorBanner
            error={error}
            title="Loan Action Alert"
            onDismiss={() => setError(null)}
          />
        )}

        {/* Status & Overview Bar */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge status={loan.loanStatus} />
            <span className="text-xs text-slate-400">
              Disbursed on {formatDate(loan.startDate)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">
              Vatti Rate
            </span>
            <span className="text-sm font-bold font-mono text-indigo-400">
              ₹{Number(loan.interestRate || 0).toFixed(2)} / ₹100
            </span>
          </div>
        </div>

        {/* Financial Balance Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Original Principal
            </span>
            <span className="text-sm sm:text-base font-bold font-mono text-white mt-1 block">
              {formatCurrency(loan.principalAmount)}
            </span>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Outstanding Principal
            </span>
            <span className="text-sm sm:text-base font-bold font-mono text-rose-400 mt-1 block">
              {formatCurrency(loan.remainingPrincipal)}
            </span>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Monthly Vatti
            </span>
            <span className="text-sm sm:text-base font-bold font-mono text-indigo-300 mt-1 block">
              {formatCurrency(loan.monthlyInterestAmount)}
            </span>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">
              Principal Repaid
            </span>
            <span className="text-sm sm:text-base font-bold font-mono text-emerald-400 mt-1 block">
              {formatCurrency(loan.totalPrincipalPaid)}
            </span>
          </div>
        </div>

        {/* Accrual and Settlement Payoff Card */}
        <div className="p-4 bg-gradient-to-r from-indigo-950/30 to-slate-950 border border-indigo-500/20 rounded-2xl space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span>Accrued Interest to Date ({loan.daysElapsed || 0} days elapsed):</span>
            <span className="font-mono font-bold text-indigo-300">
              {formatCurrency(loan.accruedInterestToDate)}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Total Interest Paid So Far:</span>
            <span className="font-mono text-emerald-400">
              {formatCurrency(loan.totalInterestPaid)}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-white font-bold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Total Estimated Payoff Today:
            </span>
            <span className="font-mono text-base text-amber-400">
              {formatCurrency(payoffTotal)}
            </span>
          </div>
        </div>

        {/* Outstanding Balance Notice */}
        {hasOutstandingBalance && !showPayoffConfirm && loan.loanStatus === 'ACTIVE' && (
          <div className="p-3.5 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs text-amber-300/90 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-200">Outstanding Balance Active: </span>
              In accordance with banking & lending rules, loans cannot be closed until the remaining principal ({formatCurrency(loan.remainingPrincipal)}) is paid. Click <span className="font-bold text-white">"Payoff & Close"</span> below to record the settlement and close the loan in one step.
            </div>
          </div>
        )}

        {/* PAYOFF & CLOSE CONFIRMATION PANEL */}
        {showPayoffConfirm && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-emerald-300 uppercase tracking-wide flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-emerald-400" />
                Payoff Balance & Close Loan Account
              </h5>
              <button
                type="button"
                onClick={() => setShowPayoffConfirm(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-emerald-200/90 leading-relaxed">
              This will record a final settlement repayment of <strong className="text-white font-mono">{formatCurrency(payoffTotal)}</strong> (Interest: {formatCurrency(accruedInterestNum)} + Principal: {formatCurrency(remainingPrincipalNum)}). The remaining principal will reach ₹0, and the loan will automatically transition to <strong>CLOSED</strong>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <Select
                label="Payment Method"
                value={payoffPaymentType}
                onChange={(e) => setPayoffPaymentType(e.target.value)}
              >
                <option value="CASH">Cash in Hand</option>
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                <option value="CHEQUE">Bank Cheque</option>
              </Select>

              <Input
                label="Transaction Reference / Cheque #"
                placeholder="e.g. SETTLE-8912"
                value={payoffReference}
                onChange={(e) => setPayoffReference(e.target.value)}
              />
            </div>

            <Input
              label="Settlement Remarks"
              value={closeNotes}
              onChange={(e) => setCloseNotes(e.target.value)}
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-emerald-500/20">
              <Button
                variant="secondary"
                size="xs"
                onClick={() => setShowPayoffConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="emerald"
                size="sm"
                icon={CheckCircle2}
                loading={payingOff}
                onClick={handlePayoffAndClose}
              >
                Confirm Payoff & Close Loan
              </Button>
            </div>
          </div>
        )}

        {/* Details & Notes */}
        <div className="text-xs text-slate-400 space-y-1">
          {loan.purpose && (
            <div>
              <span className="text-slate-300 font-semibold">Purpose:</span> {loan.purpose}
            </div>
          )}
          {loan.notes && (
            <div>
              <span className="text-slate-300 font-semibold">Notes:</span> {loan.notes}
            </div>
          )}
          <div>
            <span className="text-slate-300 font-semibold">Associated Collaterals:</span> {loan.collateralCount || 0} vault documents
          </div>
          <div>
            <span className="text-slate-300 font-semibold">Repayment Transactions:</span> {loan.paymentRecordsCount || 0} receipts recorded
          </div>
        </div>

        {/* Regular Administrative Close Confirmation (when principal is 0) */}
        {showCloseConfirm && (
          <div className="p-4 bg-rose-950/40 border border-rose-500/30 rounded-2xl space-y-3 animate-fade-in">
            <h5 className="text-xs font-bold text-rose-300 uppercase tracking-wide flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Confirm Loan Settlement & Closure
            </h5>
            <p className="text-xs text-rose-200/90">
              This will mark the loan account as CLOSED and verify all balances are reconciled.
            </p>
            <Input
              label="Settlement Remarks"
              value={closeNotes}
              onChange={(e) => setCloseNotes(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="secondary"
                size="xs"
                onClick={() => setShowCloseConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="xs"
                loading={closing}
                onClick={handleCloseLoan}
              >
                Confirm Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default LoanDetailModal;
