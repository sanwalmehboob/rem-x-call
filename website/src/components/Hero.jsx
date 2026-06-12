import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
    return (
        <div className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1549923746-c502d488b3ea?q=80&w=2071&auto=format&fit=crop"
                    alt="Sales professional calling"
                    className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full pt-10 md:pt-32">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-3xl"
                >
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-sans font-bold text-white leading-[1.1] md:leading-[1.1] mb-6 tracking-tight">
                        CALLING OUT MADE EASY FOR <br className="hidden sm:block" />
                        <span className="text-primary italic">TODAY'S SALES</span> TEAMS!
                    </h1>

                    <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 md:mb-10 max-w-2xl leading-relaxed">
                        REM-X-CALL gives your agents the tools they need to connect with customers
                        at scale. Secure, isolated workspaces keep your data protected while you grow.
                    </p>

                    <button className="w-full sm:w-auto px-8 py-4 bg-primary text-black text-lg font-bold rounded hover:bg-primary/90 transition-all transform hover:scale-105 shadow-xl shadow-primary/20">
                        Start Free Trial
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default Hero;
