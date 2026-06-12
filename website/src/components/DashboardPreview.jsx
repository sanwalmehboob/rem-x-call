import React from 'react';
import { motion } from 'framer-motion';

const DashboardPreview = () => {
    return (
        <section className="bg-gray-50 py-16 md:py-24 relative overflow-hidden px-4 md:px-0">
            <div className="max-w-6xl mx-auto md:px-6 relative z-10 w-full overflow-x-hidden">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="bg-white rounded-[20px] md:rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row w-full"
                >
                    {/* Dashboard Sidebar */}
                    <div className="w-full md:w-1/4 bg-gray-50/50 p-4 md:p-6 border-b md:border-b-0 md:border-r border-gray-100 hidden sm:block">
                        <div className="flex items-center gap-2 mb-6 md:mb-10">
                            <div className="w-6 h-6 md:w-8 md:h-8 bg-primary rounded flex items-center justify-center">
                                <span className="font-bold text-black text-sm md:text-base leading-none">R<span className="text-[10px]">x</span></span>
                            </div>
                            <span className="font-bold md:text-lg">RemXCall</span>
                        </div>

                        <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-100 mb-2 md:mb-6">
                            <div className="flex items-center gap-2 mb-2 md:mb-4">
                                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full"></div>
                                <span className="text-xs md:text-sm font-semibold text-green-600">Active</span>
                            </div>
                            <p className="text-[10px] md:text-xs text-gray-500 mb-1">Next Payment</p>
                            <h3 className="text-lg md:text-2xl font-bold">24 Nov</h3>
                        </div>
                    </div>

                    {/* Dashboard Main Area */}
                    <div className="flex-1 p-4 md:p-8 w-full overflow-x-hidden">
                        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-8 text-black">Dashboard</h2>

                        <div className="flex flex-col xl:flex-row gap-4 md:gap-6 mb-6 md:mb-8">
                            {/* Fake Graph Area */}
                            <div className="flex-1 bg-white border border-gray-100 rounded-xl p-4 md:p-6 shadow-sm overflow-hidden">
                                <div className="flex justify-between items-center mb-4 md:mb-6">
                                    <h3 className="font-semibold text-sm md:text-base">Calls</h3>
                                    <span className="text-[10px] md:text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">Weekly ▾</span>
                                </div>
                                {/* CSS Bar Chart */}
                                <div className="h-32 md:h-40 flex items-end gap-1 md:gap-2 justify-between px-1 md:px-2">
                                    {[40, 70, 85, 45, 90, 60, 20].map((h, i) => (
                                        <div key={i} className="w-full max-w-[20px] sm:max-w-[40px] flex flex-col justify-end gap-1 h-full">
                                            <motion.div
                                                initial={{ height: 0 }}
                                                whileInView={{ height: `${h}%` }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1, delay: i * 0.1 }}
                                                className="w-full bg-green-700 rounded-t-sm"
                                            ></motion.div>
                                            <motion.div
                                                initial={{ height: 0 }}
                                                whileInView={{ height: `${100 - h}%` }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1, delay: i * 0.1 }}
                                                className={`w-full rounded-b-sm ${i === 3 ? 'bg-red-500' : 'bg-primary/60'}`}
                                            ></motion.div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between px-2 md:px-3 mt-2 md:mt-3 text-[10px] md:text-xs text-gray-400 font-medium">
                                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, index) => <span key={index}>{d}</span>)}
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="w-full xl:w-1/3 grid grid-cols-2 gap-3 md:gap-4">
                                {[
                                    { label: 'Connected Calls', val: '1,240', color: 'bg-green-500', trend: '+14%' },
                                    { label: 'Voicemail', val: '1,240', color: 'bg-green-500', trend: '+14%' },
                                    { label: 'Busy', val: '1,240', color: 'bg-green-500', trend: '+14%' },
                                    { label: 'Failed', val: '1,240', color: 'bg-red-500', trend: '+14%' },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white border border-gray-100 rounded-xl p-3 md:p-4 shadow-sm flex flex-col justify-between">
                                        <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
                                            <div className={`w-1.5 h-1.5 md:w-2 md:h-2 ${stat.color} rounded-sm`}></div>
                                            <span className="text-[9px] md:text-[10px] text-gray-500 font-medium truncate">{stat.label}</span>
                                        </div>
                                        <h4 className="text-lg md:text-xl font-bold">{stat.val}</h4>
                                        <span className="text-[9px] md:text-[10px] text-green-500">{stat.trend}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Fake Table */}
                        <div>
                            <h3 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Live Calls activity</h3>
                            <div className="overflow-x-auto w-full pb-2">
                                <table className="w-full text-xs md:text-sm text-left min-w-[500px]">
                                    <thead className="text-[10px] md:text-xs text-gray-400 border-b border-gray-100 whitespace-nowrap">
                                        <tr>
                                            <th className="pb-2 md:pb-3 font-medium">Agent Name</th>
                                            <th className="pb-2 md:pb-3 font-medium">Phone</th>
                                            <th className="pb-2 md:pb-3 font-medium">Duration</th>
                                            <th className="pb-2 md:pb-3 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { name: 'Christine Muller', phone: '+1 234 567 8900', dur: '01:54', stat: 'In Call', color: 'text-green-600' },
                                            { name: 'Michael Johnson', phone: '+1 234 567 8901', dur: '03:45', stat: 'On Hold', color: 'text-green-600' },
                                            { name: 'Sarah Connor', phone: '+1 234 567 8902', dur: '00:20', stat: 'Declined', color: 'text-red-500' },
                                        ].map((row, i) => (
                                            <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 whitespace-nowrap">
                                                <td className="py-3 md:py-4 font-medium">{row.name}</td>
                                                <td className="py-3 md:py-4 text-gray-500">{row.phone}</td>
                                                <td className="py-3 md:py-4 text-gray-500">{row.dur}</td>
                                                <td className={`py-3 md:py-4 font-medium flex items-center gap-1 md:gap-2 ${row.color}`}>
                                                    <div className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${row.color.replace('text-', 'bg-')}`}></div>
                                                    {row.stat}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default DashboardPreview;
