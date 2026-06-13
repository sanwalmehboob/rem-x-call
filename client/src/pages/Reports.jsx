import React from 'react';
import { ChevronDown } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, LineChart, Line 
} from 'recharts';

const mockBarData = [
  { name: 'Jan', value: 3 },
  { name: 'Feb', value: 45 },
  { name: 'Mar', value: 25 },
  { name: 'Apr', value: 45 },
  { name: 'May', value: 65 },
  { name: 'Jun', value: 40 },
];

const mockLineData = [
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

const CustomBar = (props) => {
  const { x, y, width, height, fill } = props;
  const radius = 10;
  return (
    <g>
      <defs>
        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8bed21" stopOpacity={1} />
          <stop offset="100%" stopColor="#d1fae5" stopOpacity={1} />
        </linearGradient>
      </defs>
      <path
        d={`M${x},${y + radius} a${radius},${radius} 0 0,1 ${radius},-${radius} h${width - 2 * radius} a${radius},${radius} 0 0,1 ${radius},${radius} v${height - radius} a${radius},${radius} 0 0,1 -${radius},${radius} h-${width - 2 * radius} a${radius},${radius} 0 0,1 -${radius},-${radius} z`}
        fill="url(#barGradient)"
      />
    </g>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-3 py-2 shadow-lg rounded-xl ring-1 ring-gray-100 text-[12px] font-bold text-gray-800">
        <p className="mb-1 text-gray-500">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
            {entry.name}: {entry.value}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const Reports = () => {
  return (
    <div className="w-full bg-[#f4f5f7] min-h-full py-4 flex flex-col animate-in fade-in duration-500" style={{ gap: '16px' }}>
      
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 border max-w-max p-1 rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          <h1 className="text-[20px] font-['SF_Compact',_system-ui] font-[790] text-gray-900 tracking-tight px-4 border-r border-gray-100">
            Reports & Analytics
          </h1>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#f8f9fb] rounded-xl text-[12px] font-bold text-gray-700 hover:bg-gray-100 transition-colors">
              <span className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-[8px] text-blue-600">C</span>
              Company <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#f8f9fb] rounded-xl text-[12px] font-bold text-gray-700 hover:bg-gray-100 transition-colors">
              Agent name <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#f8f9fb] rounded-xl text-[12px] font-bold text-gray-700 hover:bg-gray-100 transition-colors">
              Date range <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 shadow-sm rounded-xl text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors">
          Weekly <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Call Statistics Block */}
      <div 
        className="w-full rounded-[24px] overflow-hidden shadow-sm flex flex-col"
        style={{ 
          background: 'linear-gradient(90deg, #ADF808 19%, #5AD43D 89%)',
          minHeight: '605px',
          gap: '16px'
        }}
      >
        <div className="px-6 py-4 shrink-0">
          <h2 className="text-[16px] font-bold text-[#1a1a1a]">Call Statistics</h2>
        </div>
        <div className="bg-white rounded-[24px] m-1 ring-1 ring-gray-100 shadow-inner flex-1 flex flex-col">
          
          <div className="p-6 md:p-8 flex-1 flex flex-col">
            <h3 className="text-[13px] font-bold text-gray-400 mb-8">Contacts Overview</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {[
                { label: 'Total Calls', val: '1,000', up: true },
                { label: 'Connected Calls', val: '42,310', up: false },
                { label: 'No Answer', val: '42,310', up: false },
                { label: 'Busy', val: '42,310', up: false },
                { label: 'Failed', val: '1,240', up: false },
              ].map((stat, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-[12px] font-bold text-gray-500 mb-1">{stat.label}</span>
                  <div className="flex items-end gap-2">
                    <span className="text-[32px] font-['SF_Compact',_system-ui] font-[790] text-gray-900 leading-none tracking-tight">{stat.val}</span>
                    <span className={`flex items-center text-[10px] font-bold pb-1 ${stat.up ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.up ? '↑' : '↓'} 30.2%
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-gray-400 mt-0.5">Vs last week</span>
                </div>
              ))}
            </div>
            
            <div className="h-px bg-gray-100 w-full my-8"></div>
            
            <h3 className="text-[13px] font-bold text-gray-400 mb-6">Total Calls</h3>
            <div className="flex-1 w-full" style={{ minHeight: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockBarData} barSize={28}>
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
                  <RechartsTooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />} />
                  <Bar dataKey="value" shape={<CustomBar />} radius={[10, 10, 10, 10]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>

      {/* Generated Revenue Block */}
      <div 
        className="w-full flex flex-col"
        style={{ minHeight: '746px', gap: '31px' }}
      >
        {/* Revenue Header */}
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[22px] font-['SF_Compact',_system-ui] font-[790] text-gray-900 tracking-tight">Generated Revenue</h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-xl text-[12px] font-bold text-gray-700 hover:bg-gray-50 transition-colors">
            This Month <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>

        {/* Revenue Card */}
        <div 
          className="w-full rounded-[24px] overflow-hidden shadow-sm flex flex-col flex-1"
          style={{ background: 'linear-gradient(90deg, #ADF808 19%, #5AD43D 89%)' }}
        >
          <div className="px-8 py-5 flex items-center gap-12 shrink-0">
            <div>
              <span className="text-[13px] font-bold text-gray-800 opacity-90 block mb-1">Total Revenue</span>
              <div className="flex items-end gap-3 text-[#1a1a1a]">
                <div className="w-3 h-3 rounded-sm bg-[#58c005] mb-1.5"></div>
                <span className="text-[28px] font-['SF_Compact',_system-ui] font-[790] tracking-tight leading-none">$5000</span>
                <span className="text-[11px] font-bold pb-1 text-gray-800 opacity-80">↑ 30% then last week</span>
              </div>
            </div>
            <div>
              <span className="text-[13px] font-bold text-gray-800 opacity-90 block mb-1">Refunded</span>
              <div className="flex items-end gap-3 text-[#1a1a1a]">
                <div className="w-3 h-3 rounded-sm bg-white mb-1.5"></div>
                <span className="text-[28px] font-['SF_Compact',_system-ui] font-[790] tracking-tight leading-none">$2000</span>
                <span className="text-[11px] font-bold pb-1 text-gray-800 opacity-80">↑ 30% then last week</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[24px] m-1 ring-1 ring-gray-100 shadow-inner p-6 md:p-8 flex-1 flex flex-col">
            <div className="flex-1 w-full" style={{ minHeight: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockLineData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#E5E7EB" horizontal={false} />
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

    </div>
  );
};

export default Reports;
