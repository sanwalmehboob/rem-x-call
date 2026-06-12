import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Features = () => {
    const [activeIdx, setActiveIdx] = useState(0);

    const sections = [
        {
            id: 'feature-0',
            title: "Super admin oversight",
            desc: "Super admin oversight allows your organization to centralize activities and manage data effectively, with robust monitoring tools.",
            img: "dash-1"
        },
        {
            id: 'feature-1',
            title: "Isolated agent workspaces",
            desc: "Isolated agent workspaces provide a secure environment for your team to operate without interference.",
            img: "dash-2"
        },
        {
            id: 'feature-2',
            title: "Data stays protected",
            desc: "Isolated agent workspaces ensure that your team's data remains secure and protected from any outside interference.",
            img: "dash-3"
        }
    ];

    useEffect(() => {
        const handleScroll = () => {
            const sectionElements = sections.map(s => document.getElementById(s.id));
            let currentActive = 0;

            sectionElements.forEach((el, index) => {
                if (el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.top <= window.innerHeight / 2) {
                        currentActive = index;
                    }
                }
            });

            setActiveIdx(currentActive);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const yOffset = -100; // Adjusted offset for mobile headers
            const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <section id="features" className="py-16 md:py-24 bg-white relative">
            <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row gap-10 md:gap-16 relative">

                {/* Left / Top Sticky Column */}
                <div className="w-full md:w-1/3 relative">
                    <div className="md:sticky md:top-32 bg-white/95 backdrop-blur-sm z-20 py-4 md:py-0 border-b md:border-b-0 border-gray-100 mb-8 md:mb-0">
                        <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 md:mb-4 block">Proper Process for calling</span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-8 md:mb-12">
                            <span className="text-primary italic">THREE MAIN</span><br />
                            THINGS <span className="text-black leading-none">WE OFFER</span>
                        </h2>

                        <ul className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-6 md:gap-0 pb-4 md:pb-0 space-x-4 md:space-x-0 md:space-y-6 md:border-l-2 md:border-gray-100 md:pl-6 snap-x hide-scrollbar">
                            {sections.map((s, i) => {
                                const isActive = activeIdx === i;
                                return (
                                    <li
                                        key={i}
                                        onClick={() => scrollToSection(s.id)}
                                        className={`font-semibold shrink-0 text-sm md:text-lg cursor-pointer flex items-center md:gap-3 relative transition-colors duration-300 snap-center ${isActive ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        <div className="hidden md:block">
                                            {isActive ? (
                                                <span className="absolute -left-[30px] w-2 h-2 bg-black rounded-full" />
                                            ) : (
                                                <span className="absolute -left-[30px] w-2 h-2 bg-white border border-gray-400 rounded-full" />
                                            )}
                                        </div>
                                        {s.title.split(' ')[0]} {s.title.split(' ')[1]}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>

                {/* Right Scrolling Content */}
                <div className="w-full md:w-2/3 space-y-16 md:space-y-32">
                    {sections.map((section, idx) => (
                        <motion.div
                            key={idx}
                            id={section.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ margin: "-50px", once: true }}
                            transition={{ duration: 0.6 }}
                            className="scroll-mt-24 md:scroll-mt-32"
                        >
                            <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">{section.title}</h3>
                            <p className="text-sm md:text-base text-gray-500 mb-6 md:mb-8 max-w-xl leading-relaxed">{section.desc}</p>

                            <div className="bg-gray-50 rounded-2xl md:rounded-3xl p-4 md:p-8 border border-gray-100 shadow-sm aspect-[4/3] flex items-center justify-center relative overflow-hidden group hover:shadow-md transition-shadow">
                                <div className="absolute inset-0 bg-white/40 group-hover:bg-transparent transition-colors duration-500 z-10"></div>

                                {idx === 0 && (
                                    <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover rounded-xl shadow-lg opacity-80 mix-blend-multiply" alt="super admin" />
                                )}
                                {idx === 1 && (
                                    <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover rounded-xl shadow-lg opacity-80 mix-blend-multiply" alt="agent workspace" />
                                )}
                                {idx === 2 && (
                                    <img src="https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1470&auto=format&fit=crop" className="w-full h-full object-cover rounded-xl shadow-lg opacity-80 mix-blend-multiply" alt="data protection" />
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default Features;
