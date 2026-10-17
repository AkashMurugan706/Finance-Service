import React, { useState, useEffect } from 'react';
import { Calculator, Sparkles, RefreshCw } from 'lucide-react';
import { BRAND_CONFIG } from '../../config/brandConfig';
import loanService from '../../services/loanService';
import { Modal, Input, Select, Button } from '../../components/common';
import InterestPreview from './InterestPreview';

export const StandaloneCalculatorModal = ({ isOpen, onClose }) => {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(2.0);
  const [tenure, setTenure] = useState(12);
  const [interestType, setInterestType] = useState('VATTI_PER_HUNDRED');
  const [backendCalculation, setBackendCalculation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      handleCalculate();
    }
  }, [isOpen, principal, rate, tenure, interestType]);

  const handleCalculate = async () => {
    if (principal <= 0 || rate <= 0) return;
    try {
      setLoading(true);
      const res = await loanService.calculateInterest({
        principalAmount: Number(principal),
        rate: Number(rate),
        interestType,
        startDate: new Date().toISOString().split('T')[0],
      });
      setBackendCalculation(res);
    } catch {
      setBackendCalculation(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Instant Vatti Interest Engine"
      subtitle="Verify exact Indian community lending accrual and APR equivalent"
      icon={Calculator}
      maxWidth="lg"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Principal Amount (₹)"
            type="number"
            prefix={BRAND_CONFIG.currencySymbol}
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
          />

          <Input
            label="Vatti Rate (₹ per ₹100 / mo)"
            type="number"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />

          <Input
            label="Tenure (Months)"
            type="number"
            min="1"
            max="120"
            value={tenure}
            onChange={(e) => setTenure(e.target.value)}
          />
        </div>

        <InterestPreview
          principal={principal}
          rate={rate}
          interestType={interestType}
          tenureMonths={tenure}
          previewData={backendCalculation}
        />
      </div>
    </Modal>
  );
};

export default StandaloneCalculatorModal;
