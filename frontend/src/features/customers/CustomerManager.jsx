import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  MapPin,
  CreditCard,
  FileText,
  UserCheck,
} from 'lucide-react';
import customerService from '../../services/customerService';
import {
  Button,
  Input,
  Card,
  Modal,
  TableSkeleton,
  ErrorBanner,
} from '../../components/common';

export const CustomerManager = ({ onSelectCustomerForLoan }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Register Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newCust, setNewCust] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    address: '',
    panOrAadhaar: '',
    occupation: 'Small Business / Agriculture',
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await customerService.getCustomers(searchQuery);
      setCustomers(data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!newCust.fullName || !newCust.phoneNumber) {
      alert('Name and phone number are required.');
      return;
    }

    try {
      setSaving(true);
      await customerService.createCustomer(newCust);
      setIsModalOpen(false);
      setNewCust({
        fullName: '',
        phoneNumber: '',
        email: '',
        address: '',
        panOrAadhaar: '',
        occupation: 'Small Business / Agriculture',
      });
      fetchCustomers();
    } catch (err) {
      alert(err.message || 'Failed to register customer');
    } finally {
      setSaving(false);
    }
  };

  const filtered = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.fullName?.toLowerCase().includes(q) ||
      c.phoneNumber?.toLowerCase().includes(q) ||
      c.customerCode?.toLowerCase().includes(q) ||
      c.panOrAadhaar?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-400" />
            Borrowers & Community Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Registered borrowers, verified KYC contacts, and linked loan counts
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsModalOpen(true)}
        >
          Register New Borrower
        </Button>
      </div>

      {error && (
        <ErrorBanner
          error={error}
          onRetry={fetchCustomers}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Search Bar */}
      <div className="w-full sm:w-96">
        <Input
          placeholder="Search borrowers by name, phone, Aadhaar..."
          prefix={<Search className="w-4 h-4 text-slate-500" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card
        title="Verified Community Borrowers"
        subtitle={`Showing ${filtered.length} borrower accounts`}
        icon={UserCheck}
      >
        {loading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-slate-400 space-y-3">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-xs">No borrowers registered yet.</p>
            <Button variant="primary" size="xs" onClick={() => setIsModalOpen(true)}>
              Register First Borrower
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pl-2">Borrower Name & Code</th>
                  <th className="pb-3">Contact & Phone</th>
                  <th className="pb-3">Aadhaar / PAN</th>
                  <th className="pb-3">Address</th>
                  <th className="pb-3 text-center">Active Loans</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 pl-2 font-semibold text-slate-100">
                      <div>{c.fullName}</div>
                      <div className="text-[10px] text-indigo-400 font-mono">
                        {c.customerCode || `CUST-${c.id}`}
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-300 font-mono">
                      {c.phoneNumber}
                    </td>
                    <td className="py-3.5 font-mono text-slate-400">
                      {c.panOrAadhaar || '—'}
                    </td>
                    <td className="py-3.5 text-slate-400 truncate max-w-[200px]">
                      {c.address || 'Local Community'}
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs">
                        {c.activeLoansCount || 0} Loans
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Register Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Community Borrower"
        subtitle="Create a verified borrower account with KYC documents"
        icon={Plus}
      >
        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="e.g. Ramesh Kumar"
            value={newCust.fullName}
            onChange={(e) => setNewCust({ ...newCust, fullName: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Mobile Phone Number *"
              placeholder="e.g. 98401 23456"
              value={newCust.phoneNumber}
              onChange={(e) => setNewCust({ ...newCust, phoneNumber: e.target.value })}
            />
            <Input
              label="Email Address"
              placeholder="e.g. ramesh@example.com"
              value={newCust.email}
              onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Aadhaar / PAN Card #"
              placeholder="e.g. 4829-1928-3841"
              value={newCust.panOrAadhaar}
              onChange={(e) => setNewCust({ ...newCust, panOrAadhaar: e.target.value })}
            />
            <Input
              label="Occupation / Trade"
              placeholder="e.g. Retail Store Owner"
              value={newCust.occupation}
              onChange={(e) => setNewCust({ ...newCust, occupation: e.target.value })}
            />
          </div>

          <Input
            label="Residential Address"
            placeholder="e.g. No 14, Main Road, Ward 2"
            value={newCust.address}
            onChange={(e) => setNewCust({ ...newCust, address: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={saving}>
              Register Borrower
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CustomerManager;
