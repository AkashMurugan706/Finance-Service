import React, { useState, useEffect } from 'react';
import {
  Shield,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  RotateCcw,
  MapPin,
  FileText,
  Calendar,
  CheckCircle2,
  Lock,
  Unlock,
  Building,
  User,
  Eye,
  UploadCloud,
  Image as ImageIcon,
  X,
  FileCheck,
} from 'lucide-react';
import { BRAND_CONFIG, formatCurrency, formatDate } from '../../config/brandConfig';
import collateralService from '../../services/collateralService';
import customerService from '../../services/customerService';
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
import CollateralDocumentViewerModal from './CollateralDocumentViewerModal';

export const CollateralTracker = () => {
  const [collaterals, setCollaterals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // In-App Document Viewer Modal
  const [viewingCollateral, setViewingCollateral] = useState(null);

  // Pledge Modal
  const [isPledgeModalOpen, setIsPledgeModalOpen] = useState(false);
  const [submittingPledge, setSubmittingPledge] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [newCollateral, setNewCollateral] = useState({
    customerId: '',
    loanId: '',
    documentType: BRAND_CONFIG.documentTypes[0],
    documentNumber: '',
    titleOrDescription: '',
    estimatedValue: 200000,
    vaultStorageLocation: BRAND_CONFIG.vaultLocations[0],
    verifiedBy: 'Branch Manager',
    notes: '',
    documentFileUrl: '',
  });

  // File Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Return Modal
  const [selectedForReturn, setSelectedForReturn] = useState(null);
  const [returnNotes, setReturnNotes] = useState('Loan fully settled. Handed over to borrower.');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  useEffect(() => {
    fetchCollaterals();
  }, [statusFilter]);

  const fetchCollaterals = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (statusFilter !== 'ALL') {
        filters.status = statusFilter;
      }
      const data = await collateralService.getCollaterals(filters);
      setCollaterals(data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const openPledgeModal = async () => {
    setIsPledgeModalOpen(true);
    setSelectedFile(null);
    setFilePreview(null);
    try {
      const [custList, loanList] = await Promise.all([
        customerService.getCustomers(),
        loanService.getLoans({ status: 'ACTIVE' }),
      ]);
      setCustomers(custList || []);
      setLoans(loanList || []);
      if (custList?.length > 0 && !newCollateral.customerId) {
        setNewCollateral((prev) => ({
          ...prev,
          customerId: custList[0].id,
          loanId: loanList?.[0]?.id || '',
        }));
      }
    } catch (err) {
      console.warn('Failed loading dropdown options:', err);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    // Create client-side preview URL
    const reader = new FileReader();
    reader.onload = (event) => {
      setFilePreview(event.target.result);
    };
    reader.readAsDataURL(file);

    // Upload to server
    try {
      setUploadingFile(true);
      const res = await collateralService.uploadDocument(file);
      if (res?.fileUrl) {
        setNewCollateral((prev) => ({ ...prev, documentFileUrl: res.fileUrl }));
      }
    } catch (err) {
      console.warn('Backend file upload fell back to Data URL:', err);
      // Fallback: attach base64 Data URL directly
      const base64Reader = new FileReader();
      base64Reader.onload = () => {
        setNewCollateral((prev) => ({ ...prev, documentFileUrl: base64Reader.result }));
      };
      base64Reader.readAsDataURL(file);
    } finally {
      setUploadingFile(false);
    }
  };

  const removeUploadedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setNewCollateral((prev) => ({ ...prev, documentFileUrl: '' }));
  };

  const handlePledgeSubmit = async (e) => {
    e.preventDefault();
    if (!newCollateral.customerId || !newCollateral.titleOrDescription) {
      alert('Please fill customer and asset description.');
      return;
    }

    try {
      setSubmittingPledge(true);
      await collateralService.pledgeCollateral({
        ...newCollateral,
        customerId: Number(newCollateral.customerId),
        loanId: newCollateral.loanId ? Number(newCollateral.loanId) : null,
        estimatedValue: Number(newCollateral.estimatedValue || 0),
        documentNumber: newCollateral.documentNumber || `DOC-${Date.now().toString().slice(-6)}`,
      });
      setIsPledgeModalOpen(false);
      setSelectedFile(null);
      setFilePreview(null);
      fetchCollaterals();
    } catch (err) {
      alert(err.message || 'Failed to pledge collateral');
    } finally {
      setSubmittingPledge(false);
    }
  };

  const handleReturnSubmit = async () => {
    if (!selectedForReturn) return;
    try {
      setSubmittingReturn(true);
      await collateralService.returnCollateral(selectedForReturn.id, returnNotes);
      setSelectedForReturn(null);
      fetchCollaterals();
    } catch (err) {
      alert(err.message || 'Failed to return collateral');
    } finally {
      setSubmittingReturn(false);
    }
  };

  const filteredItems = collaterals.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.documentType?.toLowerCase().includes(q) ||
      item.titleOrDescription?.toLowerCase().includes(q) ||
      item.documentNumber?.toLowerCase().includes(q) ||
      item.customerName?.toLowerCase().includes(q) ||
      item.vaultStorageLocation?.toLowerCase().includes(q)
    );
  });

  const totalValue = filteredItems
    .filter((c) => c.status === 'PLEDGED' || c.status === 'VERIFIED')
    .reduce((acc, curr) => acc + (Number(curr.estimatedValue) || 0), 0);

  const pledgedCount = filteredItems.filter((c) => c.status === 'PLEDGED').length;

  return (
    <div className="space-y-6">
      {/* Header & Quick Metrics */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-amber-400" />
            Collateral & Pathram Vault Tracker
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Physical deed (Pathram) locator, high-resolution document scanner, and vault lockup inventory
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="gold"
            icon={Plus}
            onClick={openPledgeModal}
          >
            Pledge New Asset & Scan
          </Button>
        </div>
      </div>

      {/* Vault KPI Summary Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/70 border border-amber-500/30 rounded-2xl p-4 backdrop-blur-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Secured Vault Value
            </span>
            <div className="text-xl font-bold font-mono text-white">
              {formatCurrency(totalValue)}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 backdrop-blur-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Active Pledged Assets
            </span>
            <div className="text-xl font-bold font-mono text-indigo-300">
              {pledgedCount} Documents / Assets
            </div>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 backdrop-blur-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Vault Facility
            </span>
            <div className="text-sm font-semibold text-white">
              6 Verified Storage Lockers
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <ErrorBanner
          error={error}
          onRetry={fetchCollaterals}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search by deed no, customer, locker..."
            prefix={<Search className="w-4 h-4 text-slate-500" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'PLEDGED', 'VERIFIED', 'RETURNED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors shrink-0 ${
                statusFilter === st
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Collateral Table & Card List */}
      <Card
        title="Secured Assets Inventory"
        subtitle={`Showing ${filteredItems.length} registered collateral records with digital document viewer`}
        icon={Lock}
      >
        {loading ? (
          <TableSkeleton rows={4} cols={6} />
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-3">
            <Shield className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-sm">No collateral documents match your criteria.</p>
            <Button variant="outline" size="sm" onClick={openPledgeModal}>
              Pledge First Document
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pl-2">Asset / Document</th>
                  <th className="pb-3">Borrower & Loan</th>
                  <th className="pb-3">Vault Storage Location</th>
                  <th className="pb-3 text-right">Estimated Value</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 pr-2 text-right">Actions & Inspection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="py-3.5 pl-2">
                      <div className="font-semibold text-slate-100 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{item.titleOrDescription}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 font-mono flex items-center gap-1.5">
                        <span>{item.documentType}</span>
                        <span>•</span>
                        <span>#{item.documentNumber || 'N/A'}</span>
                        {item.documentFileUrl && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Scan Attached
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5">
                      <div className="font-medium text-slate-200">
                        {item.customerName || `Customer #${item.customerId}`}
                      </div>
                      {item.loanNumber ? (
                        <div className="text-[11px] font-mono text-indigo-400 mt-0.5">
                          Linked Loan #{item.loanNumber}
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          General Security
                        </div>
                      )}
                    </td>

                    <td className="py-3.5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 font-mono text-[11px] text-amber-300">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        {item.vaultStorageLocation || 'Main Safe Locker'}
                      </div>
                    </td>

                    <td className="py-3.5 text-right font-mono font-bold text-white text-sm">
                      {formatCurrency(item.estimatedValue)}
                    </td>

                    <td className="py-3.5 text-center">
                      <Badge status={item.status} />
                    </td>

                    <td className="py-3.5 pr-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Document Preview Button */}
                        <Button
                          variant="secondary"
                          size="xs"
                          icon={Eye}
                          onClick={() => setViewingCollateral(item)}
                          title="View high-resolution document and custody certificate"
                        >
                          View
                        </Button>

                        {item.status === 'PLEDGED' || item.status === 'VERIFIED' ? (
                          <Button
                            variant="secondary"
                            size="xs"
                            icon={RotateCcw}
                            onClick={() => setSelectedForReturn(item)}
                          >
                            Return
                          </Button>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">
                            Returned {formatDate(item.returnDate)}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* PLEDGE COLLATERAL MODAL WITH FILE UPLOAD */}
      <Modal
        isOpen={isPledgeModalOpen}
        onClose={() => setIsPledgeModalOpen(false)}
        title="Pledge Collateral / Pathram"
        subtitle="Safely register property deeds, gold valuations, or vehicle documents with digital scans"
        icon={Lock}
        maxWidth="lg"
      >
        <form onSubmit={handlePledgeSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Borrower *"
              value={newCollateral.customerId}
              onChange={(e) => setNewCollateral({ ...newCollateral, customerId: e.target.value })}
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.phoneNumber})
                </option>
              ))}
            </Select>

            <Select
              label="Link to Active Loan (Optional)"
              value={newCollateral.loanId}
              onChange={(e) => setNewCollateral({ ...newCollateral, loanId: e.target.value })}
            >
              <option value="">General Borrower Security</option>
              {loans.map((l) => (
                <option key={l.id} value={l.id}>
                  Loan #{l.loanNumber} ({formatCurrency(l.principalAmount, false)})
                </option>
              ))}
            </Select>

            <Select
              label="Document / Asset Category"
              value={newCollateral.documentType}
              onChange={(e) => setNewCollateral({ ...newCollateral, documentType: e.target.value })}
            >
              {BRAND_CONFIG.documentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>

            <Input
              label="Document / Certificate #"
              placeholder="e.g. DEED-TN-2024-9182"
              value={newCollateral.documentNumber}
              onChange={(e) => setNewCollateral({ ...newCollateral, documentNumber: e.target.value })}
            />
          </div>

          <Input
            label="Asset Title / Description *"
            placeholder="e.g. 1.5 Acre Agricultural Patta Doc or 42 Grams 22K Gold Jewels"
            value={newCollateral.titleOrDescription}
            onChange={(e) => setNewCollateral({ ...newCollateral, titleOrDescription: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Estimated Market Value (₹)"
              type="number"
              prefix={BRAND_CONFIG.currencySymbol}
              value={newCollateral.estimatedValue}
              onChange={(e) => setNewCollateral({ ...newCollateral, estimatedValue: e.target.value })}
            />

            <Select
              label="Physical Vault Storage Location"
              value={newCollateral.vaultStorageLocation}
              onChange={(e) => setNewCollateral({ ...newCollateral, vaultStorageLocation: e.target.value })}
            >
              {BRAND_CONFIG.vaultLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </Select>
          </div>

          {/* DIGITAL DOCUMENT UPLOAD ZONE */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 tracking-wide">
              Digital Document Scan / Photo (Optional)
            </label>
            <div className="p-4 bg-slate-950/70 border-2 border-dashed border-slate-700 hover:border-indigo-500/80 rounded-2xl transition-colors text-center relative group">
              {filePreview ? (
                <div className="flex items-center justify-between p-2 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    {selectedFile?.type.includes('pdf') ? (
                      <div className="w-10 h-10 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center font-bold text-xs">
                        PDF
                      </div>
                    ) : (
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="w-10 h-10 object-cover rounded-lg border border-slate-700"
                      />
                    )}
                    <div className="text-left text-xs">
                      <div className="font-semibold text-white truncate max-w-[200px]">
                        {selectedFile?.name || 'Document Uploaded'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {uploadingFile ? 'Uploading to server...' : 'Ready for in-app viewing'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={removeUploadedFile}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block space-y-2">
                  <UploadCloud className="w-8 h-8 text-indigo-400 mx-auto transition-transform group-hover:scale-110" />
                  <div>
                    <span className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
                      Click to upload deed scan / photo
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Supports JPG, PNG, WEBP, PDF (Up to 10MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              variant="secondary"
              onClick={() => setIsPledgeModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="gold"
              type="submit"
              loading={submittingPledge || uploadingFile}
            >
              Deposit in Vault & Save Scan
            </Button>
          </div>
        </form>
      </Modal>

      {/* IN-APP DOCUMENT VIEWER MODAL */}
      <CollateralDocumentViewerModal
        collateral={viewingCollateral}
        isOpen={Boolean(viewingCollateral)}
        onClose={() => setViewingCollateral(null)}
      />

      {/* RETURN COLLATERAL CONFIRMATION MODAL */}
      <Modal
        isOpen={Boolean(selectedForReturn)}
        onClose={() => setSelectedForReturn(null)}
        title="Release & Return Collateral"
        subtitle="Authorize physical return of deed or security asset to customer"
        icon={Unlock}
      >
        {selectedForReturn && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <div className="font-bold text-white text-sm">
                {selectedForReturn.titleOrDescription}
              </div>
              <div className="text-slate-400">
                Borrower: <span className="text-white font-medium">{selectedForReturn.customerName}</span>
              </div>
              <div className="text-slate-400">
                Storage: <span className="font-mono text-amber-300">{selectedForReturn.vaultStorageLocation}</span>
              </div>
              <div className="text-slate-400">
                Valuation: <span className="font-mono text-emerald-400 font-bold">{formatCurrency(selectedForReturn.estimatedValue)}</span>
              </div>
            </div>

            <Input
              label="Release Authorization / Notes"
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <Button
                variant="secondary"
                onClick={() => setSelectedForReturn(null)}
              >
                Cancel
              </Button>
              <Button
                variant="emerald"
                loading={submittingReturn}
                onClick={handleReturnSubmit}
              >
                Confirm Return to Borrower
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CollateralTracker;
