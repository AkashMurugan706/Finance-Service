import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Plus,
  RefreshCw,
  Calculator,
  ChevronRight,
  User,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { BRAND_CONFIG, formatCurrency, formatDate } from '../../config/brandConfig';
import loanService from '../../services/loanService';
import {
  Button,
  Input,
  Select,
  Badge,
  Card,
  TableSkeleton,
  ErrorBanner,
} from '../../components/common';
import LoanDetailModal from './LoanDetailModal';

export const LoanList = ({ onOpenNewLoan }) => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedLoan, setSelectedLoan] = useState(null);

  useEffect(() => {
    fetchLoans();
  }, [statusFilter]);

  const fetchLoans = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (statusFilter !== 'ALL') {
        filters.status = statusFilter;
      }
      const data = await loanService.getLoans(filters);
      setLoans(data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLoans = loans.filter((l) => {
    const q = searchQuery.toLowerCase();
    return (
      l.loanNumber?.toLowerCase().includes(q) ||
      l.customerName?.toLowerCase().includes(q) ||
      l.customerPhone?.toLowerCase().includes(q) ||
      l.purpose?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-indigo-400" />
            Lending Accounts Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete registry of community loan contracts, active balances, and Vatti interest terms
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="emerald"
            icon={Plus}
            onClick={onOpenNewLoan}
          >
            Disburse New Loan
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <ErrorBanner
          error={error}
          onRetry={fetchLoans}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Search and Status Filters */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search by loan #, borrower name, phoneNumber..."
            prefix={<Search className="w-4 h-4 text-slate-500" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'ACTIVE', 'CLOSED', 'PENDING_APPROVAL', 'DEFAULTED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors shrink-0 ${statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card
        title="Lending Accounts"
        subtitle={`Showing ${filteredLoans.length} contracts`}
        icon={FileText}
      >
        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : filteredLoans.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-3">
            <FileText className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-sm">No loans found matching your query.</p>
            <Button variant="emerald" size="sm" onClick={onOpenNewLoan}>
              Disburse First Loan
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pl-2">Loan # & Borrower</th>
                  <th className="pb-3 text-right">Disbursed</th>
                  <th className="pb-3 text-right">Remaining Principal</th>
                  <th className="pb-3 text-right">Vatti Rate</th>
                  <th className="pb-3 text-right">Accrued Interest</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 pr-2 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLoans.map((l) => (
                  <tr
                    key={l.id}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3.5 pl-2">
                      <div className="font-semibold text-slate-100 flex items-center gap-2">
                        <span>{l.customerName || 'Borrower'}</span>
                      </div>
                      <div className="text-[11px] font-mono text-indigo-400 mt-0.5">
                        #{l.loanNumber} • Start: {formatDate(l.startDate)}
                      </div>
                    </td>

                    <td className="py-3.5 text-right font-mono font-medium text-slate-200">
                      {formatCurrency(l.principalAmount)}
                    </td>

                    <td className="py-3.5 text-right font-mono font-bold text-rose-400 text-sm">
                      {formatCurrency(l.remainingPrincipal)}
                    </td>

                    <td className="py-3.5 text-right font-mono text-indigo-300">
                      ₹{Number(l.interestRate || 0).toFixed(2)} / ₹100
                    </td>

                    <td className="py-3.5 text-right font-mono font-medium text-amber-300">
                      {formatCurrency(l.accruedInterestToDate)}
                    </td>

                    <td className="py-3.5 text-center">
                      <Badge status={l.loanStatus} />
                    </td>

                    <td className="py-3.5 pr-2 text-right">
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => setSelectedLoan(l)}
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Loan Inspection and Settlement Modal */}
      {selectedLoan && (
        <LoanDetailModal
          loan={selectedLoan}
          isOpen={Boolean(selectedLoan)}
          onClose={() => setSelectedLoan(null)}
          onLoanUpdated={() => {
            fetchLoans();
            setSelectedLoan(null);
          }}
        />
      )}
    </div>
  );
};

export default LoanList;
