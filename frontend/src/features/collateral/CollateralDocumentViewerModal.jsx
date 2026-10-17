import React, { useState } from 'react';
import {
  FileText,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Printer,
  Download,
  ShieldCheck,
  MapPin,
  ExternalLink,
  Building,
  CheckCircle2,
  Lock,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { formatCurrency, formatDate, BRAND_CONFIG } from '../../config/brandConfig';
import { Modal, Button, Badge } from '../../components/common';
import { API_BASE_URL } from '../../services/apiClient';

export const CollateralDocumentViewerModal = ({
  collateral,
  isOpen,
  onClose,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!collateral) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const hasCustomFile = Boolean(collateral.documentFileUrl);
  const backendBase = API_BASE_URL.replace(/\/api\/?$/, '');
  const fileUrl = collateral.documentFileUrl?.startsWith('http') || collateral.documentFileUrl?.startsWith('data:')
    ? collateral.documentFileUrl
    : collateral.documentFileUrl
    ? `${backendBase}${collateral.documentFileUrl.startsWith('/') ? '' : '/'}${collateral.documentFileUrl}`
    : null;

  const isPdf = fileUrl?.toLowerCase().includes('.pdf');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={collateral.titleOrDescription}
      subtitle={`Vault Custody Document: ${collateral.documentType} • #${collateral.documentNumber || 'N/A'}`}
      icon={ShieldCheck}
      maxWidth="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          {/* Zoom / Rotate Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRotate}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
              title="Rotate 90°"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-2 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-mono"
            >
              {Math.round(zoom * 100)}%
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={Printer}
              onClick={() => window.print()}
            >
              Print Document
            </Button>
            <Button variant="primary" size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Verification and Storage Details Header Strip */}
        <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Badge status={collateral.status} />
            <span className="font-semibold text-slate-200">
              Borrower: {collateral.customerName || `Customer #${collateral.customerId}`}
            </span>
            {collateral.loanNumber && (
              <span className="font-mono text-indigo-400">
                (Loan #{collateral.loanNumber})
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono">
            <div className="flex items-center gap-1 text-amber-300 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              Locker: {collateral.vaultStorageLocation || 'Main Safe Locker'}
            </div>
            <div className="text-emerald-400 font-bold">
              Valuation: {formatCurrency(collateral.estimatedValue)}
            </div>
          </div>
        </div>

        {/* Document Canvas Display */}
        <div className="relative min-h-[420px] max-h-[580px] bg-[#070A11] rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center p-4">
          {hasCustomFile && fileUrl ? (
            isPdf ? (
              <iframe
                src={fileUrl}
                title="Document PDF Viewer"
                className="w-full h-[500px] rounded-xl border border-slate-800"
              />
            ) : (
              <div className="overflow-auto max-h-[520px] w-full flex items-center justify-center">
                <img
                  src={fileUrl}
                  alt={collateral.titleOrDescription}
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transition: 'transform 0.2s ease-out',
                  }}
                  className="max-w-full max-h-[500px] object-contain rounded-xl shadow-2xl"
                />
              </div>
            )
          ) : (
            /* Digital Legal Certificate Watermark Viewer for Physical Deeds */
            <div
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: 'transform 0.2s ease-out',
              }}
              className="w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-2xl p-6 sm:p-8 text-center relative shadow-2xl space-y-4 selection:bg-amber-500 selection:text-black"
            >
              {/* Background Watermark Stamp */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <ShieldCheck className="w-64 h-64 text-amber-400" />
              </div>

              {/* Certificate Header */}
              <div className="border-b border-amber-500/30 pb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-2">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="text-base font-extrabold text-white uppercase tracking-wider">
                  SMS Finance Vault Custody Record
                </h4>
                <p className="text-[11px] text-amber-300 font-mono mt-0.5">
                  Verified Original Physical Collateral
                </p>
              </div>

              {/* Document Identity */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Document Type:</span>
                  <span className="font-semibold text-white">{collateral.documentType}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Registration / Deed #:</span>
                  <span className="text-amber-300 font-bold">{collateral.documentNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pledged Asset:</span>
                  <span className="text-white font-medium truncate max-w-[220px]">{collateral.titleOrDescription}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Physical Vault Location:</span>
                  <span className="text-cyan-300 font-bold">{collateral.vaultStorageLocation}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Assessed Value:</span>
                  <span className="text-emerald-400 font-bold">{formatCurrency(collateral.estimatedValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pledge Date:</span>
                  <span className="text-slate-300">{formatDate(collateral.pledgeDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Verified By:</span>
                  <span className="text-slate-300">{collateral.verifiedBy || 'SMS Branch Manager'}</span>
                </div>
              </div>

              {/* Custody Guarantee Badge */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-200/90 text-left flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Original Document In Safekeeping: </strong>
                  The original physical title/certificate is securely locked inside {collateral.vaultStorageLocation}. It will be released immediately upon full loan repayment.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notes & Verification Details */}
        {collateral.notes && (
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400">
            <span className="text-slate-300 font-semibold">Verification Notes: </span>
            {collateral.notes}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CollateralDocumentViewerModal;
