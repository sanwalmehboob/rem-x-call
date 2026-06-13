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
  ChevronDown,
} from 'lucide-react';
import { api } from '../../lib/api';
import ContactDetailModal from '../../components/modals/ContactDetailModal';
import QuickNoteModal from '../../components/modals/QuickNoteModal';
import PaginationFooter from '../../components/PaginationFooter';

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
  const [success, setSuccess] = useState('');
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [menuId, setMenuId] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [noteModal, setNoteModal] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

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

  const handleSaveNote = async () => {
    if (!noteModal) return;
    setSavingNote(true);
    setError('');
    try {
      const { data } = await api.patch(`/contacts/${noteModal.id}`, { notes: noteText });
      const updated = data?.contact || { ...noteModal, notes: noteText };
      setContacts((prev) => prev.map((contact) => (contact.id === noteModal.id ? { ...contact, notes: updated.notes } : contact)));
      setNoteModal(null);
      setNoteText('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save note.');
    } finally {
      setSavingNote(false);
    }
  };

  const openNoteModal = (contact) => {
    setNoteModal(contact);
    setNoteText(contact.notes || '');
    setSelectedContact(null);
    setMenuId(null);
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
    <div className="w-full bg-white rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] ring-1 ring-gray-200/60 min-h-full p-6 md:p-8 flex flex-col animate-in fade-in duration-500">
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

      {success && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          {success}
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
              <tr
                key={contact.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedContact(contact)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedContact(contact);
                  }
                }}
                className={`cursor-pointer border-b border-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} hover:bg-gray-50/80 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#8bed21]/40`}
              >
                <td className="p-4" onClick={(e) => e.stopPropagation()}>
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
                <td className="p-4 text-[13px] font-semibold text-gray-600">
                  <span title={contact.notes || ''} className={contact.notes ? 'line-clamp-2 block max-w-[220px]' : 'text-gray-400'}>
                    {contact.notes || '-'}
                  </span>
                </td>
                <td className="p-4 text-center relative" onClick={(e) => e.stopPropagation()}>
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
                      <div className="absolute right-4 top-10 z-30 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 text-left" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-gray-700 hover:bg-gray-50"
                          onClick={() => {
                            setSelectedContact(contact);
                            setMenuId(null);
                          }}
                        >
                          <Eye className="w-4 h-4" /> View Details
                        </button>
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
                          onClick={() => openNoteModal(contact)}
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

      {!loading && (
        <PaginationFooter
          page={page}
          pageSize={pageSize}
          totalItems={pagination.totalItems}
          totalPages={pagination.totalPages}
          itemLabel="contacts"
          onPageChange={setPage}
        />
      )}

      <ContactDetailModal
        contact={selectedContact}
        onClose={() => setSelectedContact(null)}
        onCall={(contact) => {
          setSelectedContact(null);
          handleCallNow(contact);
        }}
        onEditNote={openNoteModal}
        formatDate={formatDate}
        renderStatus={statusPill}
      />

      <QuickNoteModal
        open={Boolean(noteModal)}
        noteText={noteText}
        saving={savingNote}
        onChange={setNoteText}
        onClose={() => setNoteModal(null)}
        onSave={handleSaveNote}
      />
    </div>
  );
}
