import React from 'react';
import { Calculator, Sparkles, Calendar, Clock, Percent, ShieldCheck } from 'lucide-react';
import { formatCurrency, vattiToApr } from '../../config/brandConfig';

export const InterestPreview = ({
  principal = 100000,
  rate = 2.0,
  interestType = 'VATTI_PER_HUNDRED',
  startDate,
  tenureMonths = 12,
  previewData = null,
}) => {
  const principalNum = Number(principal) || 0;
  const rateNum = Number(rate) || 0;
  const tenure = Number(tenureMonths) || 1;

  // Local calculation fallback if backend calculation isn't passed
  const monthlyInterest = previewData?.monthlyInterest ?? (principalNum * (rateNum / 100));
  const dailyInterest = previewData?.dailyInterest ?? (monthlyInterest / 30);
  const totalTenureInterest = monthlyInterest * tenure;
  const totalPayable = principalNum + totalTenureInterest;
  const apr = previewData?.annualEquivalentRate ?? vattiToApr(rateNum);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden shadow-fintech">
      <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-indigo-500/20">
        <div className="flex items-center gap-2 text-indigo-400">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              Vatti Interest Engine Preview
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                BigDecimal Precision
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Community 30-day standard accrual rule
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">Annual Equivalent</span>
          <span className="text-sm font-bold font-mono text-emerald-400">
            {apr}% p.a.
          </span>
        </div>
      </div>

      {/* Metric Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4">
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Monthly Interest
          </span>
          <span className="text-base font-bold font-mono text-white mt-1 block">
            {formatCurrency(monthlyInterest)}
          </span>
          <span className="text-[10px] text-indigo-400/90 font-mono">
            ₹{rateNum.toFixed(2)} / ₹100
          </span>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Daily Accrual
          </span>
          <span className="text-base font-bold font-mono text-cyan-300 mt-1 block">
            {formatCurrency(dailyInterest)}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            1/30th monthly
          </span>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            {tenure} Mo. Total Interest
          </span>
          <span className="text-base font-bold font-mono text-amber-400 mt-1 block">
            {formatCurrency(totalTenureInterest)}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {tenure} tenure payments
          </span>
        </div>

        <div className="bg-slate-900/80 p-3 rounded-xl border border-emerald-500/20">
          <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block">
            Total Payable
          </span>
          <span className="text-base font-bold font-mono text-emerald-400 mt-1 block">
            {formatCurrency(totalPayable)}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Principal + Interest
          </span>
        </div>
      </div>

      {/* Mathematical Explanation Banner */}
      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[11px] text-slate-300 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-indigo-300">Vatti Standard: </span>
          For principal of {formatCurrency(principalNum, false)} at ₹{rateNum.toFixed(2)} Vatti, monthly interest is calculated as ({formatCurrency(principalNum, false)} × {rateNum}) / 100 = {formatCurrency(monthlyInterest)}.
          Payments received will automatically settle accrued interest first before amortizing principal.
        </div>
      </div>
    </div>
  );
};

export default InterestPreview;
