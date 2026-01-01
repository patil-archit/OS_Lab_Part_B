import React from 'react';
import { NavLink } from 'react-router-dom';

const Home = () => {
    return (
        <div className="animate-in fade-in duration-500">
            {/* Hero Section */}
            <section className="min-h-[60vh] flex flex-col items-center justify-center text-center relative max-w-4xl mx-auto">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-400/20 blur-[100px] rounded-full pointer-events-none"></div>

                <div className="z-10 flex flex-col items-center gap-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-black/5 shadow-sm text-xs font-medium text-ink/60 mb-4">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        v2.0 Multi-Page
                    </div>

                    <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-[1] text-ink">
                        OS Concepts<br />
                        <span className="text-ink/40">Visualized.</span>
                    </h1>

                    <p className="text-xl text-ink/60 max-w-xl leading-relaxed">
                        Explore the fundamental primitives, dangers, and algorithms that power modern operating systems.
                    </p>

                    <div className="flex gap-4 mt-8">
                        <NavLink to="/primitives" className="bg-ink text-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform">
                            Explore Primitives
                        </NavLink>
                        <NavLink to="/scheduling" className="bg-white text-ink border border-black/10 px-8 py-4 rounded-full font-bold hover:bg-gray-50 transition-colors">
                            Scheduling Algos
                        </NavLink>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
