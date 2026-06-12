import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Mail,
  Phone,
  Building2,
  Calendar,
  FileText,
  MoreVertical,
  PhoneCall,
  Plus,
  Eye,
  X,
  ChevronDown,
} from 'lucide-react';
import { api } from '../../lib/api';

const STATUS_OPTIONS = [
  { id: 'all', label: 'All statuses' },
  { id: 'active', label: 'Active', dot: 'bg-[#22c55e]', bg: 'bg-green-50', text: 'text-[#16a34a]' },
  { id: 'inactive', label: 'Inactive', dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-600' },
];

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

function PillDropdown({ label, value, options, onChange, renderOption }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === value) || options[0];
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between gap-2 min-w-[140px] px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-[13px] font-bold text-gray-800 shadow-sm hover:bg-gray-50/80 transition-colors"
      >
        <span className="truncate">{selected.label}</span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>
      {open && (
        <>
          <button type="button" className="fixed inset-0 z-20" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute left-0 top-full mt-1.5 min-w-full max-h-72 overflow-y-auto bg-white rounded-xl shadow-xl border border-gray-100 z-30 py-2">
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 text-[13px] font-semibold hover:bg-gray-50 flex items-center gap-2 ${
                  value === opt.id ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
                }`}
              >
                {renderOption ? renderOption(opt) : opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function AgentContactManagement() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [menuId, setMenuId] = useState(null);
  const [noteModal, setNoteModal] = useState(null);
  const [noteText, setNoteText] = useState('');

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchContacts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/contacts', {
        params: {
          tab: 'all',
          search: debouncedSearch.trim() || undefined,
          page,
          pageSize,
        },
      });
      setContacts(response.data.contacts || []);
      setPagination(response.data.pagination || { page: 1, totalPages: 1, totalItems: 0 });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch assigned contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleCallNow = async (contact) => {
    setMenuId(null);
    try {
      const { data } = await api.post('/calls/initiate', { contactId: contact.id });
      if (data?.success) {
        setSuccess(`Call initiated to ${contact.fullName}. Please check your phone extension.`);
        setError('');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to initiate VoIP call.');
      setSuccess('');
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [page, debouncedSearch]);

  const filteredContacts = useMemo(() => {
    if (statusFilter === 'all') return contacts;
    return contacts.filter((c) => c.status === statusFilter);
  }, [contacts, statusFilter]);

  const statusPill = (status) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-50 text-[#16a34a] border border-green-100">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-600 border border-red-100">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        Inactive
      </span>
    );
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto bg-white rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] ring-1 ring-gray-200/60 min-h-full p-6 md:p-8 flex flex-col animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-display font-[900] text-[#1a1a1a] tracking-tight">
            Contact Management
          </h1>
          <p className="text-[13px] font-bold text-gray-500 mt-1">
            Manage and check all contacts assigned to your account.
          </p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <PillDropdown
            label="Status"
            value={statusFilter}
            options={STATUS_OPTIONS}
            onChange={(id) => {
              setStatusFilter(id);
              setPage(1);
            }}
            renderOption={(opt) =>
              opt.dot ? (
                <span className={`inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-[12px] font-bold ${opt.bg} ${opt.text}`}>
                  <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                  {opt.label}
                </span>
              ) : (
                opt.label
              )
            }
          />
        </div>
        <div className="relative w-full xl:w-[280px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contact by name"
            className="w-full bg-[#f8f9fb] border border-gray-200 py-2.5 pl-10 pr-4 rounded-full text-[13px] font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8bed21]/40"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="flex-1 w-full overflow-x-auto rounded-xl ring-1 ring-gray-200/50 -mx-1">
        <table className="w-full text-left border-collapse min-w-[960px]">
          <thead>
            <tr className="border-b border-gray-100 bg-[#fafafa] text-[11px] font-bold text-gray-400">
              <th className="p-4 w-10">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300" readOnly />
              </th>
              <th className="p-4 py-3">
                <span className="inline-flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" /> Contact Name
                </span>
              </th>
              <th className="p-4 py-3">
                <span className="inline-flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" /> Phone Number
                </span>
              </th>
              <th className="p-4 py-3">
                <span className="inline-flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5" /> Company
                </span>
              </th>
              <th className="p-4 py-3">Status</th>
              <th className="p-4 py-3">
                <span className="inline-flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> Assigned Date
                </span>
              </th>
              <th className="p-4 py-3">Attempts</th>
              <th className="p-4 py-3">
                <span className="inline-flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" /> Notes
                </span>
              </th>
              <th className="p-4 py-3 text-center w-12">Action</th>
            </tr>
          </thead>
          <tbody>
            {!loading && filteredContacts.map((contact, idx) => (
              <tr key={contact.id} className={`border-b border-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} hover:bg-gray-50/80`}>
                <td className="p-4">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300" readOnly />
                </td>
                <td className="p-4 text-[13px] font-bold text-gray-800">{contact.fullName}</td>
                <td className="p-4 text-[13px] font-semibold text-gray-600 tabular-nums">{contact.phone}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2 min-w-0 max-w-[180px]">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(contact.companyName || 'CN')}&background=f4f5f7&size=40`}
                      alt=""
                      className="w-8 h-8 rounded-full shrink-0"
                    />
                    <span className="text-[13px] font-bold text-gray-800 truncate">{contact.companyName}</span>
                  </div>
                </td>
                <td className="p-4">{statusPill(contact.status)}</td>
                <td className="p-4 text-[13px] font-semibold text-gray-600 whitespace-nowrap">{formatDate(contact.createdAt)}</td>
                <td className="p-4 text-[13px] font-bold text-gray-800 tabular-nums">1</td>
                <td className="p-4 text-[13px] font-semibold text-gray-600">Assigned</td>
                <td className="p-4 text-center relative">
                  <button
                    type="button"
                    onClick={() => setMenuId(menuId === contact.id ? null : contact.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-800"
                    aria-label="Actions"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {menuId === contact.id && (
                    <>
                      <button type="button" className="fixed inset-0 z-20" onClick={() => setMenuId(null)} aria-hidden="true" />
                      <div className="absolute right-4 top-10 z-30 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 text-left">
                        <button
                          type="button"
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-gray-700 hover:bg-gray-50"
                          onClick={() => handleCallNow(contact)}
                        >
                          <PhoneCall className="w-4 h-4" /> Call Now
                        </button>
                        <button
                          type="button"
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-gray-700 hover:bg-gray-50"
                          onClick={() => {
                            setNoteModal(contact);
                            setNoteText('');
                            setMenuId(null);
                          }}
                        >
                          <Plus className="w-4 h-4" /> Add Quick Note
                        </button>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && (
        <div className="text-center py-12 text-sm font-semibold text-gray-500">
          Loading contacts data...
        </div>
      )}

      {!loading && filteredContacts.length === 0 && (
        <p className="text-center py-12 text-sm font-semibold text-gray-500">
          No contacts assigned to your account yet.
        </p>
      )}

      {/* Pagination controls */}
      {!loading && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
          <p className="text-[13px] font-semibold text-gray-500">
            Showing {filteredContacts.length} of {pagination.totalItems} contacts
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-[13px] font-bold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 transition-opacity"
            >
              Previous
            </button>
            <span className="text-[13px] font-bold text-gray-800 px-2">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-[13px] font-bold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 transition-opacity"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] shadow-2xl max-w-md w-full p-6 relative animate-in zoom-in-95">
            <button
              type="button"
              onClick={() => setNoteModal(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-900"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-[20px] font-bold text-gray-900 mb-1">Add Quick Note</h2>
            <p className="text-[13px] font-medium text-gray-500 mb-6">Add a note related to this contact.</p>
            <label className="block text-[13px] font-bold text-gray-900 mb-2">Note</label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Type your note.."
              rows={5}
              className="w-full bg-[#f8f9fb] border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8bed21]/40 resize-none"
            />
            <button
              type="button"
              onClick={() => setNoteModal(null)}
              className="mt-6 w-full py-3.5 rounded-xl bg-gradient-to-r from-[#8bed21] to-[#5AD43D] text-gray-900 text-[15px] font-bold shadow-sm hover:opacity-95 transition-opacity"
            >
              Add Note
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
