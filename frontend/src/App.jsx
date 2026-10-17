import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Shield,
  Receipt,
  Users,
  Calculator,
  RefreshCw,
  Sparkles,
  Wifi,
  WifiOff,
  Building2,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { BRAND_CONFIG, formatCurrency } from './config/brandConfig';
import brandService from './services/brandService';
import apiClient, { API_BASE_URL } from './services/apiClient';

// Common Components
import { Button, Modal } from './components/common';

// Features
import DashboardMetrics from './features/dashboard/DashboardMetrics';
import LoanCreationWizard from './features/loans/LoanCreationWizard';
import LoanList from './features/loans/LoanList';
import CollateralTracker from './features/collateral/CollateralTracker';
import RepaymentsLedger from './features/repayments/RepaymentsLedger';
import CustomerManager from './features/customers/CustomerManager';
import StandaloneCalculatorModal from './features/loans/StandaloneCalculatorModal';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [brandInfo, setBrandInfo] = useState(BRAND_CONFIG);
  const [backendOnline, setBackendOnline] = useState(null); // null = checking, true = up, false = down
  const [isCheckingBackend, setIsCheckingBackend] = useState(false);

  // Global Action Modals
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  // Check backend health & fetch brand info
  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    setIsCheckingBackend(true);
    try {
      const data = await brandService.getBrandInfo();
      if (data) {
        setBrandInfo((prev) => ({
          ...prev,
          brandName: data.brandName || prev.brandName,
          tagline: data.tagline || prev.tagline,
          currencySymbol: data.currencySymbol || prev.currencySymbol,
          defaultVattiRatePerHundred: data.defaultVattiRatePerHundred || prev.defaultVattiRatePerHundred,
          defaultGraceDays: data.defaultGraceDays || prev.defaultGraceDays,
        }));
      }
      setBackendOnline(true);
    } catch (err) {
      // Backend not yet reachable or starting up
      setBackendOnline(false);
    } finally {
      setIsCheckingBackend(false);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'loans', label: 'Loans', icon: FileText },
    { id: 'wizard', label: 'Disburse Loan', icon: PlusCircle, highlight: true },
    { id: 'collateral', label: 'Pathram & Vault', icon: Shield },
    { id: 'repayments', label: 'Repayments', icon: Receipt },
    { id: 'customers', label: 'Borrowers', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Ambient Glow Lighting */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-48 bg-gradient-to-b from-indigo-500/15 via-indigo-600/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Primary Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#090D16]/85 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo & Client Name */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 p-0.5 shadow-lg shadow-indigo-500/30">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-indigo-400">
                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                    {brandInfo.brandName}
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
                    {brandInfo.currencySymbol} INR
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  {brandInfo.tagline}
                </p>
              </div>
            </div>

            {/* Backend Connectivity Indicator & Quick Tools */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Backend Health Badge */}
              <button
                type="button"
                onClick={checkBackendHealth}
                title={`Click to re-check Spring Boot backend connection at ${API_BASE_URL}`}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border transition-all ${
                  backendOnline === true
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : backendOnline === false
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {isCheckingBackend ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : backendOnline === true ? (
                  <Wifi className="w-3 h-3 text-emerald-400" />
                ) : (
                  <WifiOff className="w-3 h-3 text-amber-400" />
                )}
                <span className="hidden sm:inline">
                  {backendOnline === true ? 'Backend: Connected' : backendOnline === false ? 'Backend: Offline (Demo Mode)' : 'Connecting...'}
                </span>
              </button>

              {/* Instant Vatti Calculator Tool */}
              <Button
                variant="secondary"
                size="sm"
                icon={Calculator}
                onClick={() => setIsCalculatorOpen(true)}
              >
                <span className="hidden md:inline">Vatti Calc</span>
              </Button>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 shrink-0 select-none ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 border border-indigo-400/40'
                      : item.highlight
                      ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Feature View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardMetrics
            onNavigateTab={setActiveTab}
            onOpenNewLoan={() => setActiveTab('wizard')}
            onOpenRecordPayment={() => setActiveTab('repayments')}
            onOpenPledgeCollateral={() => setActiveTab('collateral')}
          />
        )}

        {activeTab === 'loans' && (
          <LoanList onOpenNewLoan={() => setActiveTab('wizard')} />
        )}

        {activeTab === 'wizard' && (
          <LoanCreationWizard
            onLoanCreated={() => {
              // Stay or switch to loans
            }}
            onCancel={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'collateral' && (
          <CollateralTracker />
        )}

        {activeTab === 'repayments' && (
          <RepaymentsLedger />
        )}

        {activeTab === 'customers' && (
          <CustomerManager
            onSelectCustomerForLoan={() => setActiveTab('wizard')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/60 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">{brandInfo.brandName}</span>
            <span>•</span>
            <span>Community Lending Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Spring Boot 3.3.4 (Java 17)</span>
            <span>•</span>
            <span className="text-indigo-400">{API_BASE_URL}</span>
          </div>
        </div>
      </footer>

      {/* Standalone Quick Vatti Calculator Modal */}
      <StandaloneCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />
    </div>
  );
}

export default App;
