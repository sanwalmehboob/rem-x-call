import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Phone, Clock, Tag, User, Building2, PhoneCall, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { connectSocket, disconnectSocket } from '../lib/socket';

/* ── tiny helpers ─────────────────────────────────────────────── */

const Pagination = ({ meta, onPageChange }) => {
  if (!meta || meta.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-4 border-t border-gray-50 bg-white rounded-b-[16px]">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(meta.currentPage - 1)}
          disabled={meta.currentPage === 1}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(meta.currentPage + 1)}
          disabled={meta.currentPage === meta.totalPages}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-semibold">{(meta.currentPage - 1) * meta.itemsPerPage + 1}</span> to{' '}
            <span className="font-semibold">
              {Math.min(meta.currentPage * meta.itemsPerPage, meta.totalItems)}
            </span>{' '}
            of <span className="font-semibold">{meta.totalItems}</span> results
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(meta.currentPage - 1)}
              disabled={meta.currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            {[...Array(meta.totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => onPageChange(i + 1)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  meta.currentPage === i + 1
                    ? 'z-10 bg-[#ADF808] text-gray-900 focus-visible:outline-[#ADF808]'
                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => onPageChange(meta.currentPage + 1)}
              disabled={meta.currentPage === meta.totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

const TrendBadge = ({ value, isUp }) => (
  <div className="flex flex-col items-start gap-0.5">
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold leading-none ${
        isUp
          ? 'text-[#22c55e] border border-[#22c55e]/20 bg-green-50/60'
          : 'text-[#ef4444] border border-[#ef4444]/20 bg-red-50/60'
      }`}
    >
      {isUp ? '↑' : '↓'} {value}
    </span>
    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tight opacity-70">
      Vs last week
    </span>
  </div>
);

const WeeklyDropdown = ({ variant = 'white' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState('Weekly');
  const options = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

  const btnCls =
    variant === 'green'
      ? 'bg-white/90 backdrop-blur text-gray-800 border-white/60 hover:bg-white'
      : 'bg-white text-gray-800 border-gray-100 shadow-sm hover:bg-gray-50';

  return (
    <div className="relative z-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-bold transition-colors ${btnCls}`}
      >
        {selected}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          strokeWidth={3}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-20">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  setSelected(opt);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-[12px] hover:bg-gray-50 transition-colors ${
                  selected === opt ? 'font-bold text-gray-900 bg-gray-50' : 'font-medium text-gray-600'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/* ── chart placeholder data ───────────────────────────────────── */

const defaultChartData = [
  { name: 'M', failed: 0, busy: 0, connected: 0 },
  { name: 'T', failed: 0, busy: 0, connected: 0 },
  { name: 'W', failed: 0, busy: 0, connected: 0 },
  { name: 'T', failed: 0, busy: 0, connected: 0 },
  { name: 'F', failed: 0, busy: 0, connected: 0 },
  { name: 'S', failed: 0, busy: 0, connected: 0 },
  { name: 'Today', failed: 0, busy: 0, connected: 0 },
];

/* ══════════════════════════════════════════════════════════════ */
/*  DASHBOARD                                                    */
/* ══════════════════════════════════════════════════════════════ */

const Dashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState({ 
    agents: { total: 0, active: 0 },
    subscriptions: { total: 0, active: 0 },
    contacts: { total: 0, active: 0 },
    totalCalls: 0,
    followUps: 0
  });
  const [recentCalls, setRecentCalls] = useState([]);
  const [agentPerformance, setAgentPerformance] = useState([]);
  const [agentPerformanceMeta, setAgentPerformanceMeta] = useState(null);
  const [perfPage, setPerfPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  useEffect(() => {
    if (!token) return undefined;

    const socket = connectSocket(token);
    if (!socket) return undefined;

    const onConnect = () => setIsSocketConnected(true);
    const onDisconnect = () => setIsSocketConnected(false);
    const onOnlineList = (list) => {
      setOnlineUserIds(new Set((list || []).map(Number)));
    };
    const onOnlineStatus = (payload) => {
      const { userId, online } = payload || {};
      if (!userId) return;
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        if (online) next.add(Number(userId));
        else next.delete(Number(userId));
        return next;
      });
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('users:online-list', onOnlineList);
    socket.on('users:online-status', onOnlineStatus);
    setIsSocketConnected(socket.connected);
    socket.emit('users:request-online');

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('users:online-list', onOnlineList);
      socket.off('users:online-status', onOnlineStatus);
      disconnectSocket();
    };
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [statsRes, recentRes] = await Promise.allSettled([
          api.get('/dashboard/stats', { params: { period: '30d' } }),
          api.get('/dashboard/recent-calls', { params: { limit: 10 } }),
        ]);
        if (cancelled) return;
        
        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value.data);
        }
        if (recentRes.status === 'fulfilled') {
          setRecentCalls(recentRes.value.data.recentCalls || []);
        }
      } catch (err) {
        console.error('Dashboard primary stats fetch error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Separate effect for paginated performance data
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/dashboard/agent-performance', { params: { page: perfPage, limit: 5 } });
        if (cancelled) return;
        setAgentPerformance(res.data.agentPerformance || []);
        setAgentPerformanceMeta(res.data.meta);
      } catch (err) {
        console.error('Agent performance fetch error:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [perfPage]);

  const hasChartData = defaultChartData.some((d) => d.failed + d.busy + d.connected > 0);

  /* ── render ─────────────────────────────────────────────────── */
  return (
    <div className="flex min-h-0 flex-1 flex-col space-y-8 animate-in fade-in duration-500">
      {/* Page heading */}
      <h1 className="text-[32px] font-display font-[900] text-gray-900 tracking-tight mb-2">
        Dashboard
      </h1>

      {/* ───────────────────────── OVERVIEW (green section) ───────────────────────── */}
      <section
        className="w-full rounded-[16px] pt-4 pr-2 pb-2 pl-2 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        style={{ height: '282px', background: 'linear-gradient(90deg, #ADF808 19%, #5AD43D 89%)' }}
      >
        {/* Section header row */}
        <div className="flex items-center justify-between mb-4 px-3">
          <span className="text-[#1c4714] text-[15px] font-bold">
            Overview
          </span>
          <WeeklyDropdown variant="white" />
        </div>

        {/* 3-column stat cards */}
        <div className="flex gap-2 flex-1 px-2">
          {/* Agents Overview */}
          <div 
            className="bg-white rounded-[16px] flex flex-col justify-between"
            style={{ width: '457px', height: '203px', padding: '21px 16px' }}
          >
            <h3 className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">
              Agents Overview
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <p className="text-gray-400 text-[10px] font-bold mb-1">Total Agents</p>
                <span className="text-[34px] font-display font-[900] leading-none tracking-tight text-[#1a1a1a]">
                  {stats.agents.total}
                </span>
                <div className="mt-2">
                  <TrendBadge value="0.0%" isUp />
                </div>
              </div>
              <div className="flex flex-col border-l border-gray-100 pl-4">
                <p className="text-gray-400 text-[10px] font-bold mb-1">Active Agents</p>
                <span className="text-[34px] font-display font-[900] leading-none tracking-tight text-[#1a1a1a]">
                  {stats.agents.active}
                </span>
                <div className="mt-2">
                  <TrendBadge value="0.0%" isUp={false} />
                </div>
              </div>
            </div>
          </div>

          {/* Subscriptions Overview */}
          <div 
            className="bg-white rounded-[16px] flex flex-col justify-between"
            style={{ width: '457px', height: '203px', padding: '21px 16px' }}
          >
            <h3 className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">
              Subscriptions Overview
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <p className="text-gray-400 text-[10px] font-bold mb-1">Total Subscriptions</p>
                <span className="text-[34px] font-display font-[900] leading-none tracking-tight text-[#1a1a1a]">
                  {stats.subscriptions.total}
                </span>
                <div className="mt-2">
                  <TrendBadge value="0.0%" isUp />
                </div>
              </div>
              <div className="flex flex-col border-l border-gray-100 pl-4">
                <p className="text-gray-400 text-[10px] font-bold mb-1">Active Subscriptions</p>
                <span className="text-[34px] font-display font-[900] leading-none tracking-tight text-[#1a1a1a]">
                  {stats.subscriptions.active}
                </span>
                <div className="mt-2">
                  <TrendBadge value="0.0%" isUp />
                </div>
              </div>
            </div>
          </div>

          {/* Contacts Overview */}
          <div 
            className="bg-white rounded-[16px] flex flex-col justify-between"
            style={{ width: '457px', height: '203px', padding: '21px 16px' }}
          >
            <h3 className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">
              Contacts Overview
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <p className="text-gray-400 text-[10px] font-bold mb-1">Total Contacts</p>
                <span className="text-[34px] font-display font-[900] leading-none tracking-tight text-[#1a1a1a]">
                  {stats.contacts.total}
                </span>
                <div className="mt-2">
                  <TrendBadge value="0.0%" isUp />
                </div>
              </div>
              <div className="flex flex-col border-l border-gray-100 pl-4">
                <p className="text-gray-400 text-[10px] font-bold mb-1">Active Contacts</p>
                <span className="text-[34px] font-display font-[900] leading-none tracking-tight text-[#1a1a1a]">
                  {stats.contacts.active}
                </span>
                <div className="mt-2">
                  <TrendBadge value="0.0%" isUp={false} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────── CALLS SECTION ──────────────────────────── */}
      <section 
        className="w-full bg-white rounded-[16px] pt-4 pr-2 pb-6 pl-2 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100"
        style={{ height: '441px' }}
      >
        <div className="flex items-center justify-between mb-8 px-4">
          <h2 className="text-[22px] font-display font-[900] tracking-tight text-[#1a1a1a]">
            Calls
          </h2>
          <WeeklyDropdown />
        </div>

        <div className="flex flex-1 gap-[34px] px-4">
          {/* Chart */}
          <div className="flex-1 h-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={defaultChartData}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                barSize={36}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 500 }}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
                  }}
                />
                <Bar dataKey="failed" stackId="a" fill="#ef4444" radius={[0, 0, 4, 4]} />
                <Bar dataKey="busy" stackId="a" fill="#4ade80" />
                <Bar dataKey="connected" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            {/* Empty overlay */}
            {!hasChartData && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-[13px] font-semibold text-gray-400 bg-white/80 px-4 py-2 rounded-full">
                  Nothing to show yet
                </span>
              </div>
            )}
          </div>

          {/* 2×2 stat cards */}
          <div className="w-[45%] grid grid-cols-2 gap-4 h-full">
            {[
              { title: 'Connected Calls', val: stats.totalCalls || '0', isUp: true, color: 'bg-[#ADF808]' },
              { title: 'No Answer', val: '0', isUp: true, color: 'bg-[#5AD43D]' },
              { title: 'Busy', val: '0', isUp: true, color: 'bg-[#1c4714]' },
              { title: 'Failed', val: stats.followUps || '0', isUp: true, color: 'bg-[#ef4444]' },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white rounded-[16px] p-6 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className={`w-3 h-3 rounded-full ${stat.color}`} />
                <div>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[30px] font-display font-[900] leading-none tracking-tight text-[#1a1a1a]">
                      {stat.val}
                    </span>
                    <TrendBadge value="0.0%" isUp={stat.isUp} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────── TABLES: Live Calls + Agent Performance ──────────── */}
      <div 
        className="flex flex-col gap-[32px] min-h-0"
      >
        {/* Live Calls Activity */}
        <section className="bg-white rounded-[16px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[20px] font-display font-[900] tracking-tight text-[#1a1a1a]">
              Live Calls Activity
            </h2>
            <WeeklyDropdown />
          </div>
          <div className="w-full overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="py-4 text-gray-400 font-bold text-[11px] uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5" /> Agent Name
                    </div>
                  </th>
                  <th className="py-4 text-gray-400 font-bold text-[11px] uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5" /> Phone
                    </div>
                  </th>
                  <th className="py-4 text-gray-400 font-bold text-[11px] uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" /> Duration
                    </div>
                  </th>
                  <th className="py-4 text-gray-400 font-bold text-[11px] uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5" /> Status
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentCalls.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-20 text-center text-[14px] font-medium text-gray-400"
                    >
                      No Live call activities yet to found
                    </td>
                  </tr>
                ) : (
                  recentCalls.map((call) => (
                    <tr key={call.id} className="border-b border-gray-50/50 hover:bg-gray-50/30 transition-colors">
                      <td className="py-4 font-semibold text-gray-900 text-[14px]">
                        {call.contact?.fullName || 'Unknown Agent'}
                      </td>
                      <td className="py-4 text-gray-500 text-[14px]">
                        {call.contact?.phone || 'N/A'}
                      </td>
                      <td className="py-4 text-gray-500 text-[14px]">
                        {call.duration || '0s'}
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          call.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {call.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Agent Performance Overview */}
        <section className="bg-white rounded-[16px] flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100">
          <div className="flex items-center justify-between p-6 pb-2">
            <h2 className="text-[20px] font-display font-[900] tracking-tight text-[#1a1a1a]">
              Agent Performance Overview
            </h2>
            <WeeklyDropdown />
          </div>
          <div className="w-full overflow-x-auto scrollbar-hide px-6">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="py-4 text-gray-400 font-bold text-[11px] uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5" /> Agent Name
                    </div>
                  </th>
                  <th className="py-4 text-gray-400 font-bold text-[11px] uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5" /> Company
                    </div>
                  </th>
                  <th className="py-4 text-gray-400 font-bold text-[11px] uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-3.5 h-3.5" /> Calls Today
                    </div>
                  </th>
                  <th className="py-4 text-gray-400 font-bold text-[11px] uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5" /> Connected %
                    </div>
                  </th>
                  <th className="py-4 text-gray-400 font-bold text-[11px] uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-3.5 h-3.5" /> Failed %
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {agentPerformance.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 text-center text-[13px] font-medium text-gray-400"
                    >
                      No agent performance overview yet
                    </td>
                  </tr>
                ) : (
                  agentPerformance.map((item, idx) => {
                    const isOnline = onlineUserIds.has(item.id);
                    return (
                      <tr key={idx} className="border-b border-gray-50/50 hover:bg-gray-50/30 transition-colors">
                        <td className="py-4 font-semibold text-gray-900 text-[14px]">
                          <div className="flex items-center gap-2.5">
                            <span className="relative flex h-2.5 w-2.5 shrink-0">
                              {isOnline && (
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              )}
                              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isOnline ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                            </span>
                            <span>{item.agentName}</span>
                          </div>
                        </td>
                        <td className="py-4 text-gray-500 text-[14px]">
                          {item.company}
                        </td>
                        <td className="py-4 text-gray-900 font-bold text-[14px]">
                          {item.callsToday}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-[#ADF808]" style={{ width: `${item.connectedPercent}%` }} />
                            </div>
                            <span className="text-[13px] font-bold text-gray-700">{item.connectedPercent}%</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="text-[13px] font-bold text-red-500">{item.failedPercent}%</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <Pagination meta={agentPerformanceMeta} onPageChange={setPerfPage} />
        </section>
      </div>

      <div className="h-4 lg:h-6" />
    </div>
  );
};

export default Dashboard;
