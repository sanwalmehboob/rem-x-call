import React from 'react';

const CTA = () => {
    return (
        <section className="bg-black py-4 px-4 pb-0">
            <div className="w-full border-[3px] md:border-4 border-black bg-primary rounded-[20px] md:rounded-[40px] p-8 md:p-20 flex flex-col justify-center items-center text-center relative shadow-[0px_0px_50px_rgba(62,248,89,0.3)] min-h-[400px] md:min-h-[500px]">

                {/* Dotted border wrapper */}
                <div className="border border-dashed border-black/40 p-6 md:p-16 rounded-[20px] md:rounded-[30px] w-full max-w-4xl mx-auto flex flex-col items-center">
                    <h2 className="text-4xl sm:text-5xl md:text-7xl font-sans font-medium text-black leading-none mb-6 md:mb-8 tracking-tighter mix-blend-multiply opacity-80 backdrop-blur-sm shadow-xl drop-shadow-lg" style={{ textShadow: "0 0 3px rgba(0,0,0,0.1)" }}>
                        <span className="font-light">READY TO</span> <span className="font-black italic block md:inline">SCALE YOUR CALLING</span>
                    </h2>

                    <p className="text-black/70 max-w-lg mb-8 md:mb-10 text-xs md:text-sm font-medium">
                        Join teams that trust REM-X-CALL to handle their outbound operations in the industry, inspiring others and setting new standards for success.
                    </p>

                    <button className="bg-black text-white px-8 md:px-10 py-3 md:py-4 font-bold rounded-full hover:bg-gray-800 transition-colors shadow-xl w-full sm:w-auto">
                        Let's start
                    </button>
                </div>
            </div>
        </section>
    );
};

export default CTA;
