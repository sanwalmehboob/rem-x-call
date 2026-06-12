import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => setMenuOpen(!menuOpen);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || menuOpen ? 'bg-white shadow-md py-3 md:py-4' : 'bg-transparent py-4 md:py-6'}`}>
            <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">

                {/* Logo */}
                <div className="flex items-center gap-2 z-50">
                    <div className="w-8 h-8 md:w-8 md:h-8 bg-primary rounded flex items-center justify-center">
                        <span className="font-bold text-black text-sm md:text-lg leading-none">R<span className="text-[10px] md:text-xs">x</span></span>
                    </div>
                    <span className={`font-bold text-lg md:text-xl tracking-tight transition-colors ${scrolled || menuOpen ? 'text-black' : 'text-white mix-blend-difference'}`}>RemXCall</span>
                </div>

                {/* Desktop Links */}
                <div className="hidden lg:flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm border border-gray-100">
                    {['Home', 'Features', 'Pricing', 'Testimonial', 'Resources'].map((item, idx) => (
                        <a
                            key={item}
                            href={`#${item.toLowerCase()}`}
                            className={`px-4 py-2 text-sm font-semibold rounded transition-colors ${idx === 0 ? 'bg-gray-100 text-black' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            {item}
                        </a>
                    ))}
                </div>

                {/* Desktop Buttons */}
                <div className="hidden md:flex items-center gap-3 lg:gap-4">
                    <button className="px-4 lg:px-5 py-2 bg-black text-white text-sm font-semibold rounded hover:bg-gray-800 transition-colors">
                        Login
                    </button>
                    <button className="px-4 lg:px-5 py-2 bg-primary text-black text-sm font-semibold rounded hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30">
                        Signup
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <button onClick={toggleMenu} className={`md:hidden z-50 p-2 -mr-2 ${scrolled || menuOpen ? 'text-black' : 'text-white mix-blend-difference'}`}>
                    {menuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            <div className={`md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-xl transition-all duration-300 overflow-hidden ${menuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                <div className="flex flex-col p-6 gap-2">
                    {['Home', 'Features', 'Pricing', 'Testimonial', 'Resources'].map((item, idx) => (
                        <a
                            key={item}
                            href={`#${item.toLowerCase()}`}
                            onClick={() => setMenuOpen(false)}
                            className={`text-lg font-semibold py-3 border-b border-gray-50 ${idx === 0 ? 'text-black' : 'text-gray-500'}`}
                        >
                            {item}
                        </a>
                    ))}
                    <div className="flex flex-col gap-3 pt-4">
                        <button className="w-full py-3 bg-black text-white text-base font-semibold rounded-lg hover:bg-gray-800 transition-colors">
                            Login
                        </button>
                        <button className="w-full py-3 bg-primary text-black text-base font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30">
                            Signup
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
