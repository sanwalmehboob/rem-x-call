import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-black text-white pt-16 md:pt-24 pb-8 px-6 md:px-12">
            <div className="max-w-7xl mx-auto">

                {/* Large Typography */}
                <div className="mb-16 md:mb-20">
                    <h2 className="text-5xl sm:text-7xl md:text-[140px] font-sans font-bold leading-[0.85] tracking-tighter text-gray-500">
                        BUILD TO SERVE.
                    </h2>
                    <h2 className="text-5xl sm:text-7xl md:text-[140px] font-sans font-bold leading-[0.85] tracking-tighter text-white md:text-right md:-mr-10">
                        DESIGN TO SCALE.
                    </h2>
                </div>

                {/* Links Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 md:mb-32 w-full md:w-1/2 ml-auto text-sm">
                    <div>
                        <span className="font-bold mb-4 block text-gray-400">Product</span>
                        <ul className="space-y-2 text-gray-300">
                            <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Company</a></li>
                        </ul>
                    </div>
                    <div>
                        <span className="font-bold mb-4 block text-gray-400">Terms</span>
                        <ul className="space-y-2 text-gray-300">
                            <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                        </ul>
                    </div>
                    <div className="col-span-2 md:col-span-1 md:border-l md:border-white/20 md:pl-8 md:ml-8">
                        <ul className="space-y-2 text-gray-300 font-bold flex flex-row md:flex-col gap-4 md:gap-0">
                            <li><a href="#" className="hover:text-primary transition-colors">Instagram</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Youtube</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Linkedin</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Logo */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-tighter w-full md:w-auto text-center md:text-left">RemXCall</h1>
                    <p className="text-xs text-gray-600">© 2026 REM-X-CALL. All rights reserved.</p>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
