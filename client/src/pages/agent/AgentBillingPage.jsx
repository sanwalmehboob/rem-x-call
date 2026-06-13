import React, { useEffect, useMemo, useState } from 'react';
import { Search, ChevronDown, Calendar, Tag, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';

export default function AgentBillingPage() {
  const [search, setSearch] = useState('');
  const [cycleFilter, setCycleFilter] = useState('All cycles');
  const [open, setOpen] = useState(false);

  const [subscription, setSubscription] = useState(null);
  const [loadingSub, setLoadingSub] = useState(true);
  const [subError, setSubError] = useState('');

  const [history, setHistory] = useState([]);
  const [loadingHist, setLoadingHist] = useState(true);

  // Fetch current subscription
  useEffect(() => {
    let cancelled = false;
    setLoadingSub(true);
    setSubError('');
    (async () => {
      try {
        const { data } = await api.get('/subscriptions/current');
        if (!cancelled) setSubscription(data);
      } catch (err) {
        if (!cancelled) {
          const status = err?.response?.status;
          if (status === 404) {
            setSubscription(null);
          } else {
            setSubError(err?.response?.data?.message || 'Failed to load subscription');
          }
        }
      } finally {
        if (!cancelled) setLoadingSub(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Fetch billing history
  useEffect(() => {
    let cancelled = false;
    setLoadingHist(true);
    (async () => {
      try {
        const { data } = await api.get('/subscriptions/history', { params: { page: 1, pageSize: 100 } });
        if (!cancelled) setHistory(data?.data || []);
      } catch (err) {
        console.error('Failed to load billing history:', err);
      } finally {
        if (!cancelled) setLoadingHist(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const isActive = subscription?.status === 'active';
  const planName = subscription?.planName || 'No Plan';
  const billingCycle = subscription?.billingCycle || 'monthly';
  const trialEnd = subscription?.trialEndsAt
    ? new Date(subscription.trialEndsAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

  const BILLING_ROWS = useMemo(() => {
    return history.map((item) => ({
      id: item.id,
      paidDate: item.date
        ? new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'N/A',
      price: parseFloat(item.price || 0).toFixed(2),
      status: (item.status || 'paid').toUpperCase(),
      cycleEnd: `${item.planName} (${item.action})`,
      billingCycle: item.billingCycle || 'monthly',
    }));
  }, [history]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return BILLING_ROWS.filter((r) => {
      const matchesSearch = !q || `${r.paidDate} ${r.price} ${r.status} ${r.cycleEnd}`.toLowerCase().includes(q);
      const matchesCycle = cycleFilter === 'All cycles' || 
                           (cycleFilter === 'Monthly' && r.billingCycle.toLowerCase() === 'monthly') ||
                           (cycleFilter === 'Yearly' && r.billingCycle.toLowerCase() === 'yearly');
      return matchesSearch && matchesCycle;
    });
  }, [search, cycleFilter, BILLING_ROWS]);

  return (
    <div className="w-full flex flex-col gap-8 animate-in fade-in duration-500">
      <h1 className="text-[28px] md:text-[32px] font-display font-[900] text-[#1a1a1a] tracking-tight px-1">Subscription & Billings</h1>

      {/* Current plan card */}
      <div className="rounded-[16px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)] ring-1 ring-gray-200/80 bg-white">
        <div className={`h-2 ${isActive ? 'bg-gradient-to-r from-[#8bed21] to-[#5AD43D]' : 'bg-gradient-to-r from-gray-300 to-gray-400'}`} />
        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {loadingSub ? (
            <p className="text-sm font-semibold text-gray-500">Loading subscription...</p>
          ) : subError ? (
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-semibold">{subError}</p>
            </div>
          ) : !subscription ? (
            <div>
              <h2 className="text-[20px] font-bold text-gray-900 mb-2">No Active Subscription</h2>
              <p className="text-[13px] font-medium text-gray-500">Contact your admin to assign a subscription plan.</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-[20px] font-bold text-gray-900">{planName} Plan</h2>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                  isActive
                    ? 'bg-green-50 text-[#16a34a] border-green-200'
                    : 'bg-gray-50 text-gray-600 border-gray-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#22c55e]' : 'bg-gray-400'}`} />
                  {subscription.status?.toUpperCase() || 'UNKNOWN'}
                </span>
              </div>
              <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Plan Details</p>
              <div className="flex flex-wrap gap-10">
                <div>
                  <p className="text-[12px] font-semibold text-gray-500 mb-1">Billing Cycle</p>
                  <p className="text-[24px] font-display font-[900] text-gray-900 leading-none capitalize">{billingCycle}</p>
                </div>
                {subscription.price !== undefined && (
                  <div>
                    <p className="text-[12px] font-semibold text-gray-500 mb-1">Price</p>
                    <p className="text-[24px] font-display font-[900] text-gray-900 leading-none">
                      ${parseFloat(subscription.price).toFixed(2)}
                    </p>
                  </div>
                )}
                {subscription.currentPeriodEnd && (
                  <div>
                    <p className="text-[12px] font-semibold text-gray-500 mb-1">Period Ends</p>
                    <p className="text-[24px] font-display font-[900] text-gray-900 leading-none">
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                )}
                {trialEnd && (
                  <div>
                    <p className="text-[12px] font-semibold text-gray-500 mb-1">Trial Ends</p>
                    <p className="text-[24px] font-display font-[900] text-gray-900 leading-none">{trialEnd}</p>
                  </div>
                )}
                {subscription.discountPercent > 0 && (
                  <div>
                    <p className="text-[12px] font-semibold text-gray-500 mb-1">Discount</p>
                    <p className="text-[24px] font-display font-[900] text-gray-900 leading-none">{subscription.discountPercent}%</p>
                  </div>
                )}
              </div>

              {/* Features */}
              {subscription.features && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {Object.entries(subscription.features).map(([key, enabled]) => (
                    <span
                      key={key}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold border ${
                        enabled
                          ? 'bg-green-50 text-[#16a34a] border-green-100'
                          : 'bg-gray-50 text-gray-400 border-gray-100 line-through'
                      }`}
                    >
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).replace('Enabled', '')}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Billing history */}
      <div className="bg-white rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] ring-1 ring-gray-200/60 p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-[18px] font-bold text-gray-900">Billing History</h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search billing history"
                className="w-full bg-[#f8f9fb] border border-gray-200 py-2.5 pl-9 pr-3 rounded-full text-[13px] font-semibold focus:outline-none focus:ring-2 focus:ring-[#8bed21]/40"
              />
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-[13px] font-bold text-gray-800 shadow-sm"
              >
                {cycleFilter}
                <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>
              {open && (
                <>
                  <button type="button" className="fixed inset-0 z-20" onClick={() => setOpen(false)} aria-hidden />
                  <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 z-30 py-1">
                    {['All cycles', 'Monthly', 'Yearly'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setCycleFilter(opt);
                          setOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-[13px] font-semibold hover:bg-gray-50"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl ring-1 ring-gray-100">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-100 bg-[#fafafa] text-[11px] font-bold text-gray-400">
                <th className="p-4 pl-6">
                  <span className="inline-flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" /> Subscription Paid Date
                  </span>
                </th>
                <th className="p-4">
                  <span className="inline-flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5" /> Price
                  </span>
                </th>
                <th className="p-4">
                  <span className="inline-flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Status
                  </span>
                </th>
                <th className="p-4">Cycle completed</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-sm text-gray-500 font-semibold">
                    No billing history available yet.
                  </td>
                </tr>
              ) : filtered.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/60">
                  <td className="p-4 pl-6 text-[13px] font-semibold text-gray-800">{row.paidDate}</td>
                  <td className="p-4 text-[13px] font-bold text-gray-900">${row.price}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#16a34a]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                      {row.status}
                    </span>
                  </td>
                  <td className="p-4 text-[13px] font-semibold text-gray-600">{row.cycleEnd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
