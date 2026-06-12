import React from 'react';
import { motion } from 'framer-motion';

const DarkFeatures = () => {
    return (
        <section className="bg-black py-20 md:py-32 text-white relative">
            <div className="max-w-7xl mx-auto px-6 md:px-12 text-center mb-16 md:mb-20">
                <span className="inline-block px-4 py-1 rounded-full bg-white/10 text-[10px] md:text-xs font-semibold uppercase tracking-widest mb-6 md:mb-8">
                    Proper Process for calling
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight mb-4">
                    <span className="text-primary italic">THREE MAIN</span><br />
                    THINGS WE OFFER
                </h2>
                <p className="text-gray-400 font-medium max-w-xl mx-auto text-sm md:text-base">Launch your operation without the complexity</p>
            </div>

            <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:h-[500px]">

                    {/* Card 1 - Image */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="relative overflow-hidden group border-b md:border-b-0 md:border-r border-white/10 h-[300px] md:h-[400px] lg:h-full"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop"
                            alt="Agent dialing"
                            className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6 md:p-8">
                            <h3 className="text-2xl md:text-3xl font-bold">They dial with<br />confidence</h3>
                        </div>
                        {/* Logo Watermark */}
                        <div className="absolute top-6 right-6 opacity-30">
                            <span className="text-3xl md:text-4xl font-bold">Rx</span>
                        </div>
                    </motion.div>

                    {/* Card 2 - White Box */}
                    <div className="bg-white text-black p-8 md:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-200 h-[300px] md:h-[400px] lg:h-full">
                        <h3 className="text-2xl md:text-3xl font-bold">You build the<br />foundation</h3>

                        <div className="flex-1 flex justify-center items-center opacity-10">
                            <span className="text-6xl md:text-8xl font-black">Rx</span>
                        </div>

                        <p className="text-gray-500 text-xs md:text-sm leading-relaxed">
                            Isolated agent workspaces ensure that your team's data remains secure and protected from any outside interference.
                        </p>
                    </div>

                    {/* Card 3 - Image */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="relative overflow-hidden group border-b md:border-b-0 md:border-r border-white/10 h-[300px] md:h-[400px] lg:h-full"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=2070&auto=format&fit=crop"
                            alt="Agent workspace"
                            className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                        />
                        {/* Logo Watermark */}
                        <div className="absolute top-6 left-6 opacity-30">
                            <span className="text-3xl md:text-4xl font-bold text-white">Rx</span>
                        </div>
                    </motion.div>

                    {/* Card 4 - Green Box */}
                    <div className="bg-primary text-black p-8 md:p-10 flex flex-col justify-between h-[300px] md:h-[400px] lg:h-full">
                        <div className="w-full flex justify-end">
                            <span className="font-bold">RemXCall</span>
                        </div>

                        <div className="flex-1 flex justify-center items-center">
                            <span className="text-6xl md:text-8xl font-black">Rx</span>
                        </div>

                        <h3 className="text-base md:text-lg font-bold">Sell in your comfortable space</h3>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default DarkFeatures;
