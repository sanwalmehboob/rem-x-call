import React from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';

const callStats = [
  { label: 'Total Calls', value: '1,245', trend: '18.4%', up: true },
  { label: 'Connected Calls', value: '892', trend: '12.8%', up: true },
  { label: 'No Answer', value: '176', trend: '4.6%', up: false },
  { label: 'Busy', value: '94', trend: '2.1%', up: false },
  { label: 'Failed', value: '83', trend: '6.3%', up: false },
];

const callChartData = [
  { name: 'Jan', value: 120 },
  { name: 'Feb', value: 185 },
  { name: 'Mar', value: 260 },
  { name: 'Apr', value: 210 },
  { name: 'May', value: 330 },
  { name: 'Jun', value: 290 },
];

const revenueChartData = [
  { name: 'JAN', current: 80, previous: 80 },
  { name: 'FEB', current: 160, previous: 140 },
  { name: 'MAR', current: 180, previous: 120 },
  { name: 'APR', current: 240, previous: 220 },
  { name: 'MAY', current: 180, previous: 200 },
  { name: 'JUN', current: 170, previous: 150 },
  { name: 'JUL', current: 260, previous: 180 },
  { name: 'AUG', current: 210, previous: 270 },
  { name: 'SEP', current: 220, previous: 280 },
  { name: 'OCT', current: 280, previous: 180 },
  { name: 'NOV', current: 270, previous: 220 },
  { name: 'DEC', current: 350, previous: 210 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl bg-white px-3 py-2 text-[12px] font-bold text-gray-800 shadow-lg ring-1 ring-gray-100">
      <p className="mb-1 text-gray-500">{label}</p>
      {payload.map((entry) => (
        <div key={`${entry.name}-${entry.value}`} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.name}: {entry.value}
        </div>
      ))}
    </div>
  );
};

const FilterButton = ({ children, icon }) => (
  <button className="flex min-w-0 items-center justify-between gap-2 rounded-xl bg-[#f8f9fb] px-3 py-2 text-[12px] font-bold text-gray-700 transition-colors hover:bg-gray-100">
    {icon}
    <span className="truncate">{children}</span>
    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-gray-400" />
  </button>
);

const Reports = () => {
  return (
    <div className="flex min-h-full w-full min-w-0 flex-col gap-4 bg-[#f4f5f7] py-4 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full min-w-0 flex-col gap-3 rounded-2xl border bg-white p-3 shadow-sm ring-1 ring-gray-100 sm:flex-row sm:items-center lg:w-auto">
          <h1 className="text-[20px] font-[790] tracking-tight text-gray-900 sm:border-r sm:border-gray-100 sm:px-4">
            Reports & Analytics
          </h1>
          <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3 lg:w-auto">
            <FilterButton
              icon={<span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[8px] text-blue-600">C</span>}
            >
              Company
            </FilterButton>
            <FilterButton>Agent name</FilterButton>
            <FilterButton>Date range</FilterButton>
          </div>
        </div>

        <button className="flex w-full items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[13px] font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 sm:w-auto">
          Weekly <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <section
        className="block w-full min-w-0 rounded-[20px] p-1 shadow-sm sm:rounded-[24px]"
        style={{ background: 'linear-gradient(90deg, #ADF808 19%, #5AD43D 89%)' }}
      >
        <div className="px-5 py-4 sm:px-6">
          <h2 className="text-[16px] font-bold text-[#1a1a1a]">Call Statistics</h2>
        </div>

        <div className="min-h-[520px] rounded-[20px] bg-white shadow-inner ring-1 ring-gray-100 sm:rounded-[24px]">
          <div className="flex flex-col p-5 sm:p-6 md:p-8">
            <h3 className="mb-6 text-[13px] font-bold text-gray-400 sm:mb-8">Contacts Overview</h3>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
              {callStats.map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span className="mb-1 text-[12px] font-bold text-gray-500">{stat.label}</span>
                  <div className="flex flex-wrap items-end gap-2">
                    <span className="text-[28px] font-[790] leading-none tracking-tight text-gray-900 sm:text-[32px]">
                      {stat.value}
                    </span>
                    <span className={`pb-1 text-[10px] font-bold ${stat.up ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.up ? '+' : '-'} {stat.trend}
                    </span>
                  </div>
                  <span className="mt-0.5 text-[10px] font-medium text-gray-400">Vs last week</span>
                </div>
              ))}
            </div>

            <div className="my-6 h-px w-full bg-gray-100 sm:my-8" />

            <h3 className="mb-6 text-[13px] font-bold text-gray-400">Total Calls</h3>
            <div className="company-table-scroll w-full overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
              <div className="h-[240px] min-w-[520px] sm:min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={callChartData} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 'bold' }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 'bold' }}
                      dx={-10}
                    />
                    <RechartsTooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#8bed21" radius={[10, 10, 10, 10]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex w-full min-w-0 flex-col gap-6">
        <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between sm:px-2">
          <h2 className="text-[22px] font-[790] tracking-tight text-gray-900">Generated Revenue</h2>
          <button className="flex w-full items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-[12px] font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 sm:w-auto">
            This Month <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          </button>
        </div>

        <div
          className="flex w-full min-w-0 flex-col overflow-hidden rounded-[20px] shadow-sm sm:rounded-[24px]"
          style={{ background: 'linear-gradient(90deg, #ADF808 19%, #5AD43D 89%)' }}
        >
          <div className="grid shrink-0 grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-2 sm:px-8 lg:flex lg:items-center lg:gap-12">
            <div className="min-w-0">
              <span className="mb-1 block text-[13px] font-bold text-gray-800 opacity-90">Total Revenue</span>
              <div className="flex flex-wrap items-end gap-2 text-[#1a1a1a] sm:gap-3">
                <div className="mb-1.5 h-3 w-3 rounded-sm bg-[#58c005]" />
                <span className="text-[26px] font-[790] leading-none tracking-tight sm:text-[28px]">$5000</span>
                <span className="pb-1 text-[11px] font-bold text-gray-800 opacity-80">+ 30% vs last week</span>
              </div>
            </div>
            <div className="min-w-0">
              <span className="mb-1 block text-[13px] font-bold text-gray-800 opacity-90">Refunded</span>
              <div className="flex flex-wrap items-end gap-2 text-[#1a1a1a] sm:gap-3">
                <div className="mb-1.5 h-3 w-3 rounded-sm bg-white" />
                <span className="text-[26px] font-[790] leading-none tracking-tight sm:text-[28px]">$2000</span>
                <span className="pb-1 text-[11px] font-bold text-gray-800 opacity-80">+ 30% vs last week</span>
              </div>
            </div>
          </div>

          <div className="m-1 flex flex-col rounded-[20px] bg-white p-5 shadow-inner ring-1 ring-gray-100 sm:rounded-[24px] sm:p-6 md:p-8">
            <div className="company-table-scroll w-full overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
              <div className="h-[320px] min-w-[680px] sm:min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical stroke="#E5E7EB" horizontal={false} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold' }}
                      dy={15}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 'bold' }}
                      dx={-10}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="current"
                      stroke="#58c005"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, fill: '#58c005', stroke: '#fff', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="previous"
                      stroke="#bbf7d0"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, fill: '#bbf7d0', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Reports;
