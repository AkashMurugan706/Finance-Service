import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  User,
  ShieldAlert,
  Calendar,
  Sparkles,
  FileText,
  BadgePercent,
  Layers,
  FileCheck2,
  UploadCloud,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BRAND_CONFIG, formatCurrency, vattiToApr } from '../../config/brandConfig';
import loanService from '../../services/loanService';
import customerService from '../../services/customerService';
import collateralService from '../../services/collateralService';
import { Button, Input, Select, Textarea, Card, ErrorBanner, Alert } from '../../components/common';
import InterestPreview from './InterestPreview';

const PRINCIPAL_PRESETS = [25000, 50000, 100000, 200000, 500000, 1000000];
const VATTI_PRESETS = [1.5, 2.0, 2.5, 3.0, 3.5, 4.0];

export const LoanCreationWizard = ({ onLoanCreated, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Quick Customer Creation inline state
  const [showQuickCustomer, setShowQuickCustomer] = useState(false);
  const [quickCustomer, setQuickCustomer] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    panOrAadhaar: '',
  });

  // Form State
  const [formData, setFormData] = useState({
    customerId: '',
    principalAmount: 100000,
    interestRate: BRAND_CONFIG.defaultVattiRatePerHundred,
    interestType: 'VATTI_PER_HUNDRED',
    startDate: new Date().toISOString().split('T')[0],
    tenureMonths: 12,
    purpose: 'Business / Agricultural Working Capital',
    notes: '',
    // Optional immediate collateral attachment
    attachCollateral: false,
    collateralType: BRAND_CONFIG.documentTypes[0],
    collateralNumber: '',
    collateralTitle: '',
    collateralValue: 250000,
    vaultLocation: BRAND_CONFIG.vaultLocations[0],
    collateralFileUrl: '',
  });

  const [collateralFilePreview, setCollateralFilePreview] = useState(null);
  const [uploadingCollateralFile, setUploadingCollateralFile] = useState(false);
  const [backendCalculation, setBackendCalculation] = useState(null);
  const [createdLoanResult, setCreatedLoanResult] = useState(null);

  // Load customer directory for dropdown
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const data = await customerService.getCustomers();
      setCustomers(data || []);
      if (data && data.length > 0 && !formData.customerId) {
        setFormData((prev) => ({ ...prev, customerId: data[0].id }));
      }
    } catch (err) {
      console.warn('Customer load error:', err);
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Sync Interest Calculation from Backend
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.principalAmount > 0 && formData.interestRate > 0) {
        try {
          setCalculating(true);
          const result = await loanService.calculateInterest({
            principalAmount: Number(formData.principalAmount),
            rate: Number(formData.interestRate),
            interestType: formData.interestType,
            startDate: formData.startDate,
            calculationDate: new Date(new Date(formData.startDate).getTime() + (formData.tenureMonths * 30 * 86400000)).toISOString().split('T')[0],
          });
          setBackendCalculation(result);
        } catch {
          // If offline, InterestPreview gracefully falls back to local BigDecimal rules
          setBackendCalculation(null);
        } finally {
          setCalculating(false);
        }
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [formData.principalAmount, formData.interestRate, formData.interestType, formData.startDate, formData.tenureMonths]);

  const handleQuickCustomerSubmit = async (e) => {
    e.preventDefault();
    if (!quickCustomer.fullName || !quickCustomer.phoneNumber) {
      setError('Please provide at least a customer name and mobile phone number.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const newCust = await customerService.createCustomer({
        fullName: quickCustomer.fullName,
        phoneNumber: quickCustomer.phoneNumber,
        address: quickCustomer.address || 'Local Community',
        panOrAadhaar: quickCustomer.panOrAadhaar,
      });

      setCustomers((prev) => [newCust, ...prev]);
      setFormData((prev) => ({ ...prev, customerId: newCust.id }));
      setShowQuickCustomer(false);
      setQuickCustomer({ fullName: '', phoneNumber: '', address: '', panOrAadhaar: '' });
    } catch (err) {
      setError(err.message || 'Failed to register customer');
    } finally {
      setLoading(false);
    }
  };

  const handleCollateralFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCollateralFilePreview(event.target.result);
    };
    reader.readAsDataURL(file);

    try {
      setUploadingCollateralFile(true);
      const res = await collateralService.uploadDocument(file);
      if (res?.fileUrl) {
        setFormData((prev) => ({ ...prev, collateralFileUrl: res.fileUrl }));
      }
    } catch {
      const base64Reader = new FileReader();
      base64Reader.onload = () => {
        setFormData((prev) => ({ ...prev, collateralFileUrl: base64Reader.result }));
      };
      base64Reader.readAsDataURL(file);
    } finally {
      setUploadingCollateralFile(false);
    }
  };

  const handleSubmitLoan = async () => {
    if (!formData.customerId) {
      setError('Please select or create a customer before disbursing.');
      setCurrentStep(1);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Disburse Loan
      const loanPayload = {
        customerId: Number(formData.customerId),
        principalAmount: Number(formData.principalAmount),
        interestRate: Number(formData.interestRate),
        interestType: formData.interestType,
        startDate: formData.startDate,
        tenureMonths: Number(formData.tenureMonths),
        purpose: formData.purpose,
        notes: formData.notes,
      };

      const newLoan = await loanService.createLoan(loanPayload);

      // If user checked collateral, also pledge collateral in vault
      if (formData.attachCollateral && formData.collateralTitle) {
        try {
          await collateralService.pledgeCollateral({
            customerId: Number(formData.customerId),
            loanId: newLoan.id,
            documentType: formData.collateralType,
            documentNumber: formData.collateralNumber || `DOC-${Date.now().toString().slice(-6)}`,
            titleOrDescription: formData.collateralTitle,
            estimatedValue: Number(formData.collateralValue || 0),
            vaultStorageLocation: formData.vaultLocation,
            documentFileUrl: formData.collateralFileUrl || null,
            verifiedBy: 'SMS Finance Manager',
            notes: `Pledged against Loan #${newLoan.loanNumber}`,
          });
        } catch (colErr) {
          console.warn('Collateral pledge note:', colErr);
        }
      }

      setCreatedLoanResult(newLoan);
      setCurrentStep(4); // Success step

      // Fire celebratory confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      if (onLoanCreated) {
        onLoanCreated(newLoan);
      }
    } catch (err) {
      setError(err.message || 'Failed to disburse loan. Check backend logs.');
    } finally {
      setLoading(false);
    }
  };

  const selectedCustomerObj = customers.find((c) => String(c.id) === String(formData.customerId));

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Wizard Progress Stepper */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between">
          {[
            { step: 1, title: 'Borrower Profile', icon: User },
            { step: 2, title: 'Vatti Terms', icon: DollarSign },
            { step: 3, title: 'Collateral Vault', icon: ShieldAlert },
            { step: 4, title: 'Disbursement', icon: CheckCircle2 },
          ].map((item, idx) => {
            const isCompleted = currentStep > item.step || (currentStep === 4 && item.step === 4);
            const isCurrent = currentStep === item.step;
            const IconComponent = item.icon;

            return (
              <React.Fragment key={item.step}>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-300 ${isCompleted
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                        : isCurrent
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/50'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                  >
                    {isCompleted && item.step !== 4 ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <IconComponent className="w-4 h-4" />
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                      Step 0{item.step}
                    </span>
                    <span
                      className={`text-xs font-semibold ${isCurrent ? 'text-white' : 'text-slate-400'
                        }`}
                    >
                      {item.title}
                    </span>
                  </div>
                </div>

                {idx < 3 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 sm:mx-4 transition-colors ${currentStep > item.step ? 'bg-emerald-500' : 'bg-slate-800'
                      }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <ErrorBanner
          error={error}
          onDismiss={() => setError(null)}
          onRetry={currentStep === 3 ? handleSubmitLoan : undefined}
        />
      )}

      {/* STEP 1: Customer Selection */}
      {currentStep === 1 && (
        <Card
          title="Select or Register Borrower"
          subtitle="Choose an existing community borrower or create a verified profile on the fly"
          icon={User}
        >
          <div className="space-y-5">
            {!showQuickCustomer ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 tracking-wide">
                    Registered Customers
                  </label>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setShowQuickCustomer(true)}
                  >
                    + Register New Customer
                  </Button>
                </div>

                <Select
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  helperText="Select borrower account"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.phoneNumber}) - Code: {c.customerCode || `CUST-${c.id}`}
                    </option>
                  ))}
                  {customers.length === 0 && (
                    <option value="">No customers found. Click below to add one.</option>
                  )}
                </Select>

                {selectedCustomerObj && (
                  <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-white text-sm">
                        {selectedCustomerObj.fullName}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Phone: {selectedCustomerObj.phoneNumber} | Aadhaar/PAN: {selectedCustomerObj.panOrAadhaar || 'Not specified'}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Address: {selectedCustomerObj.address}
                      </div>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      Active Loans: {selectedCustomerObj.activeLoansCount || 0}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-slate-950/70 rounded-2xl border border-indigo-500/30 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-400" />
                    Quick Register Customer
                  </h4>
                  <button
                    onClick={() => setShowQuickCustomer(false)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Full Name *"
                    placeholder="e.g. Ramesh Kumar"
                    value={quickCustomer.fullName}
                    onChange={(e) => setQuickCustomer({ ...quickCustomer, fullName: e.target.value })}
                  />
                  <Input
                    label="Mobile Phone Number *"
                    placeholder="e.g. 98401 23456"
                    value={quickCustomer.phoneNumber}
                    onChange={(e) => setQuickCustomer({ ...quickCustomer, phoneNumber: e.target.value })}
                  />
                  <Input
                    label="Aadhaar / PAN"
                    placeholder="e.g. XXXX-XXXX-1234"
                    value={quickCustomer.panOrAadhaar}
                    onChange={(e) => setQuickCustomer({ ...quickCustomer, panOrAadhaar: e.target.value })}
                  />
                  <Input
                    label="Residential Address"
                    placeholder="e.g. 12 Bazaar Street, Ward 4"
                    value={quickCustomer.address}
                    onChange={(e) => setQuickCustomer({ ...quickCustomer, address: e.target.value })}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="emerald"
                    size="sm"
                    loading={loading}
                    onClick={handleQuickCustomerSubmit}
                  >
                    Save & Select Customer
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <Button
                variant="primary"
                iconRight={ArrowRight}
                disabled={!formData.customerId}
                onClick={() => setCurrentStep(2)}
              >
                Proceed to Vatti Terms
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 2: Vatti Terms & Live Calculator */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <Card
            title="Loan Financials & Community Vatti Rate"
            subtitle="Configure principal amount, monthly vatti rate per ₹100, and tenure"
            icon={DollarSign}
          >
            <div className="space-y-5">
              {/* Principal Amount with Quick Presets */}
              <div className="space-y-2">
                <Input
                  label="Principal Amount (₹)"
                  type="number"
                  prefix={BRAND_CONFIG.currencySymbol}
                  value={formData.principalAmount}
                  onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })}
                  helperText="Minimum ₹100"
                />

                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="text-[11px] text-slate-500 font-medium">Quick Select:</span>
                  {PRINCIPAL_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormData({ ...formData, principalAmount: preset })}
                      className={`px-2.5 py-1 text-xs rounded-lg font-mono transition-colors ${Number(formData.principalAmount) === preset
                          ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                        }`}
                    >
                      {formatCurrency(preset, false)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vatti Rate Slider & Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Vatti Rate (₹ per ₹100 per Month)
                  </label>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    ₹{Number(formData.interestRate).toFixed(2)} Vatti ({vattiToApr(formData.interestRate)}% APR)
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0.5"
                    max="6.0"
                    step="0.25"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({ ...formData, interestRate: Number(e.target.value) })}
                    className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="w-28 shrink-0">
                    <Input
                      type="number"
                      step="0.01"
                      suffix="₹/100"
                      value={formData.interestRate}
                      onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="text-[11px] text-slate-500 font-medium">Standard Community Rates:</span>
                  {VATTI_PRESETS.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setFormData({ ...formData, interestRate: rate })}
                      className={`px-2.5 py-1 text-xs rounded-lg font-mono transition-colors ${Number(formData.interestRate) === rate
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                        }`}
                    >
                      ₹{rate.toFixed(2)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tenure and Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select
                  label="Interest Engine Type"
                  value={formData.interestType}
                  onChange={(e) => setFormData({ ...formData, interestType: e.target.value })}
                >
                  <option value="VATTI_PER_HUNDRED">₹ Vatti Per ₹100 / Month (Standard)</option>
                  <option value="SIMPLE_MONTHLY">Simple Interest (Monthly)</option>
                  <option value="COMPOUND_MONTHLY">Compound Monthly</option>
                  <option value="FLAT_ANNUAL">Flat Annual</option>
                </Select>

                <Input
                  label="Disbursement Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />

                <Input
                  label="Tenure (Months)"
                  type="number"
                  min="1"
                  max="120"
                  value={formData.tenureMonths}
                  onChange={(e) => setFormData({ ...formData, tenureMonths: e.target.value })}
                />
              </div>

              <Input
                label="Loan Purpose / Reference"
                placeholder="e.g. Agricultural equipment, trade inventory, emergency bridge"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              />

              {/* Real-time Vatti Engine Preview Box */}
              <div className="pt-2">
                <InterestPreview
                  principal={formData.principalAmount}
                  rate={formData.interestRate}
                  interestType={formData.interestType}
                  startDate={formData.startDate}
                  tenureMonths={formData.tenureMonths}
                  previewData={backendCalculation}
                />
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <Button
                  variant="secondary"
                  icon={ArrowLeft}
                  onClick={() => setCurrentStep(1)}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  iconRight={ArrowRight}
                  onClick={() => setCurrentStep(3)}
                >
                  Continue to Collateral Vault
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* STEP 3: Collateral / Pathram Attachment */}
      {currentStep === 3 && (
        <Card
          title="Collateral & Vault Storage (Optional)"
          subtitle="Pledge original land deed (Pathram), gold evaluation, or vehicle documents in the vault"
          icon={ShieldAlert}
        >
          <div className="space-y-5">
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white block">
                  Pledge Collateral for this Loan?
                </span>
                <span className="text-xs text-slate-400">
                  Adds high-assurance security in the SMS Finance physical vault
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.attachCollateral}
                  onChange={(e) => setFormData({ ...formData, attachCollateral: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {formData.attachCollateral && (
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-amber-500/30 space-y-4 animate-fade-in">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  Asset & Vault Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Document / Asset Category"
                    value={formData.collateralType}
                    onChange={(e) => setFormData({ ...formData, collateralType: e.target.value })}
                  >
                    {BRAND_CONFIG.documentTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>

                  <Input
                    label="Document / Certificate Number"
                    placeholder="e.g. DEED-2024-TN-4829"
                    value={formData.collateralNumber}
                    onChange={(e) => setFormData({ ...formData, collateralNumber: e.target.value })}
                  />

                  <Input
                    label="Asset Title / Specification *"
                    placeholder="e.g. 2400 sq.ft Land Patta No 182 / Gold Bangles 38.4g"
                    value={formData.collateralTitle}
                    onChange={(e) => setFormData({ ...formData, collateralTitle: e.target.value })}
                  />

                  <Input
                    label="Estimated Valuation (₹)"
                    type="number"
                    prefix={BRAND_CONFIG.currencySymbol}
                    value={formData.collateralValue}
                    onChange={(e) => setFormData({ ...formData, collateralValue: e.target.value })}
                  />

                  <Select
                    label="Vault Storage Locker Location"
                    value={formData.vaultLocation}
                    onChange={(e) => setFormData({ ...formData, vaultLocation: e.target.value })}
                  >
                    {BRAND_CONFIG.vaultLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Digital Document Upload in Wizard */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Attach Deed Scan / Asset Photo (Optional)
                  </label>
                  <div className="p-3 bg-slate-950/70 border-2 border-dashed border-slate-700 hover:border-indigo-500/80 rounded-xl transition-colors text-center relative">
                    {collateralFilePreview ? (
                      <div className="flex items-center justify-between p-2 bg-slate-900 rounded-lg border border-slate-800">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-5 h-5 text-indigo-400" />
                          <span className="text-xs font-semibold text-white">
                            Scan Attached ({uploadingCollateralFile ? 'Uploading...' : 'Ready'})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCollateralFilePreview(null);
                            setFormData((prev) => ({ ...prev, collateralFileUrl: '' }));
                          }}
                          className="text-slate-400 hover:text-rose-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block space-y-1">
                        <UploadCloud className="w-6 h-6 text-indigo-400 mx-auto" />
                        <span className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold block">
                          Upload Deed Scan / Vehicle Photo
                        </span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleCollateralFileChange}
                          className="sr-only"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Summary Review Before Final Disbursement */}
            <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 text-xs space-y-2">
              <span className="font-bold text-slate-300 uppercase tracking-wider block text-[10px]">
                Disbursement Summary
              </span>
              <div className="flex justify-between text-slate-300">
                <span>Borrower:</span>
                <span className="font-semibold text-white">{selectedCustomerObj?.fullName || 'Selected Borrower'}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Principal Disbursed:</span>
                <span className="font-bold font-mono text-emerald-400">{formatCurrency(formData.principalAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Monthly Vatti Interest:</span>
                <span className="font-bold font-mono text-indigo-400">
                  {formatCurrency((formData.principalAmount * formData.interestRate) / 100)} / month
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <Button
                variant="secondary"
                icon={ArrowLeft}
                onClick={() => setCurrentStep(2)}
              >
                Back
              </Button>
              <Button
                variant="emerald"
                size="lg"
                icon={CheckCircle2}
                loading={loading}
                onClick={handleSubmitLoan}
              >
                Authorize & Disburse Loan
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 4: Success & Disbursement Receipt */}
      {currentStep === 4 && createdLoanResult && (
        <Card className="text-center p-8 border-emerald-500/40">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-extrabold text-white tracking-tight">
              Loan Disbursed Successfully!
            </h3>

            <p className="text-xs text-slate-400">
              Loan Account <span className="text-indigo-400 font-mono font-bold">#{createdLoanResult.loanNumber}</span> has been created with traditional Vatti engine rules.
            </p>

            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-left text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Loan Number:</span>
                <span className="font-mono font-bold text-white">{createdLoanResult.loanNumber}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Customer:</span>
                <span className="text-white font-medium">{createdLoanResult.customerName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Disbursed Principal:</span>
                <span className="font-mono font-bold text-emerald-400">{formatCurrency(createdLoanResult.principalAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Monthly Vatti Due:</span>
                <span className="font-mono text-indigo-300">{formatCurrency(createdLoanResult.monthlyInterestAmount)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setCurrentStep(1);
                  setCreatedLoanResult(null);
                  setFormData((prev) => ({
                    ...prev,
                    principalAmount: 100000,
                    purpose: 'Working Capital',
                    attachCollateral: false,
                  }));
                }}
              >
                Create Another Loan
              </Button>
              {onCancel && (
                <Button
                  variant="primary"
                  onClick={onCancel}
                >
                  Return to Dashboard
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default LoanCreationWizard;
