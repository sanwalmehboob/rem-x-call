import React from 'react';

const Stats = () => {
    return (
        <section className="bg-white py-32">
            <div className="max-w-6xl mx-auto px-6 md:px-12">

                {/* Top Centered Content */}
                <div className="text-center w-full max-w-4xl mx-auto mb-20">
                    <h2 className="text-4xl md:text-[44px] font-medium leading-tight mb-10 tracking-tight text-black">
                        Explore the profound impact we create at our<br className="hidden md:block" />
                        company, where tangible results not only fuel innovation but also<br className="hidden md:block" />
                        pave the way for lasting success.
                    </h2>

                    <div className="max-w-xl mx-auto mb-6">
                        <p className="text-gray-600 text-sm leading-relaxed mb-4 text-center">
                            Our commitment to excellence drives us to push the limits of innovation<br className="hidden md:block" />
                            and creativity. This pursuit leads to remarkable outcomes that resonate<br className="hidden md:block" />
                            in the industry, inspiring others and setting new standards for success.
                        </p>
                        <button className="text-primary font-medium hover:underline underline-offset-4 decoration-2 text-sm text-center w-full">
                            Start free trial
                        </button>
                    </div>
                </div>

                {/* Bottom Stat Cards */}
                <div className="flex flex-col md:flex-row gap-6 w-full max-w-5xl mx-auto">

                    {/* Card 1: 2.4M */}
                    <div className="bg-gray-50/50 rounded-[32px] p-10 flex-1 border border-gray-100 relative overflow-hidden flex flex-col justify-between pt-16 h-[320px]">
                        <div className="flex flex-col z-10">
                            <div className="mb-4">
                                <span className="inline-flex items-center text-xs font-semibold text-primary mb-1">↑ 30.2 %</span>
                                <p className="text-[10px] text-gray-400 font-medium tracking-wide">vs last week</p>
                            </div>
                            <h3 className="text-5xl md:text-6xl font-sans font-medium mb-3 text-black tracking-tight" style={{ letterSpacing: "-0.04em" }}>2.4M</h3>
                            <p className="text-gray-500 text-xs max-w-[160px] leading-relaxed">
                                calls connected every month across our platform
                            </p>
                        </div>

                        {/* The Green Wave inside the card absolute positioned */}
                        <div className="absolute right-0 bottom-0 w-3/5 h-[160px] pointer-events-none">
                            <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full stroke-primary fill-none" style={{ strokeWidth: '1.5px' }}>
                                <path d="M0,35 Q10,25 20,35 T40,35 T60,25 T80,15 T100,25" />
                            </svg>
                        </div>
                    </div>

                    {/* Card 2: 99.9% */}
                    <div className="bg-gray-50/50 rounded-[32px] p-10 flex-1 border border-gray-100 relative overflow-hidden flex flex-col justify-between pt-16 h-[320px]">
                        <div className="flex flex-col z-10 w-full">
                            <div className="flex items-end gap-4 mb-4">
                                <h3 className="text-6xl md:text-[80px] font-sans font-medium text-black leading-none" style={{ letterSpacing: "-0.04em", lineHeight: "0.8" }}>
                                    99.9%
                                </h3>
                                <div className="pb-1 text-center">
                                    <span className="block text-[10px] font-semibold text-primary">↑ 30.2 %</span>
                                    <p className="text-[9px] text-gray-400 font-medium">vs last week</p>
                                </div>
                            </div>
                            <p className="text-gray-500 text-xs max-w-[200px] leading-relaxed">
                                Uptime guarantee keeps your team calling without interruption
                            </p>
                        </div>

                        {/* The Pale Green Wave inside the card 2 */}
                        <div className="absolute right-0 bottom-0 w-3/4 h-[180px] pointer-events-none opacity-40">
                            <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full stroke-primary fill-none pointer-events-none" style={{ strokeWidth: '1px' }}>
                                <path d="M0,45 Q20,35 35,45 T65,25 T90,35 T100,45" />
                            </svg>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Stats;
