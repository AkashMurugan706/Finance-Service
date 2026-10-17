/**
 * SMS Finance Service - Global Brand & Localization Configuration
 * Dynamic brand settings matching backend AppBrandConfig with Indian Rupee (₹) standards.
 */

export const BRAND_CONFIG = {
  brandName: "SMS Finance Service",
  tagline: "Empowering Community Growth & Precision Lending",
  currencySymbol: "₹",
  currencyCode: "INR",
  contactPhone: "+91 98400 12345",
  contactEmail: "support@smsfinance.com",
  defaultVattiRatePerHundred: 2.0, // ₹2.00 per ₹100 per month (24% p.a.)
  defaultGraceDays: 5,
  vaultLocations: [
    "Vault Alpha - Shelf 1",
    "Vault Alpha - Shelf 2",
    "Vault Alpha - Safe Locker 3",
    "Vault Beta - Shelf A",
    "Vault Beta - Safe Locker B",
    "Main Vault - Deed Locker D-01"
  ],
  documentTypes: [
    "Original Property Deed (Pathram)",
    "Gold Jewellery Valuation Certificate",
    "Vehicle RC Book & Key Pledged",
    "Promissory Note & Cheque Leaves",
    "Land Survey & Patta Document",
    "Fixed Deposit Receipt Lien"
  ]
};

/**
 * Format numeric value to Indian Currency standard (₹ 1,00,000.00)
 */
export const formatCurrency = (amount, includeDecimals = true) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${BRAND_CONFIG.currencySymbol} 0${includeDecimals ? '.00' : ''}`;
  }

  const num = Number(amount);
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(num);

  return `${BRAND_CONFIG.currencySymbol} ${formatted}`;
};

/**
 * Format standard date to readable format (e.g. 16 Oct 2026)
 */
export const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

/**
 * Convert Vatti rate (₹ per ₹100 / month) to Annual Percentage Rate (APR)
 * Example: ₹2.00 Vatti = 24.0% p.a.
 */
export const vattiToApr = (ratePerHundred) => {
  const rate = Number(ratePerHundred || 0);
  return (rate * 12).toFixed(1);
};
