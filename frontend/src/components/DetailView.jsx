import React, { useEffect } from 'react';

const DetailView = ({ item, onBack }) => {
    // Scroll to top when mounted
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!item) return null;

    const Visualization = item.visualization;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out">
            {/* Navigation Breadcrumb */}
            <button
                onClick={onBack}
                className="group flex items-center gap-2 text-sm font-medium text-ink/50 hover:text-ink mb-8 transition-colors"
            >
                <span className="w-6 h-6 rounded-full bg-white border border-black/10 flex items-center justify-center group-hover:bg-ink group-hover:text-white transition-colors">
                    ←
                </span>
                Back to Index
            </button>

            {/* Header */}
            <header className="mb-12">
                <div className="inline-block px-3 py-1 bg-ink text-white text-[10px] uppercase tracking-widest font-bold rounded-full mb-4">
                    {item.subtitle}
                </div>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-ink mb-6">
                    {item.title}
                </h1>
                <p className="text-xl md:text-2xl text-ink/60 border-l-4 border-ink pl-6 py-2 max-w-2xl leading-relaxed">
                    {item.description}
                </p>
            </header>

            {/* Visualization Container */}
            {Visualization && (
                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-widest text-ink/40">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        Live Simulation
                    </div>
                    <Visualization algorithmId={item.id} />
                </div>
            )}

            {/* Content Body */}
            <article className="prose prose-lg prose-headings:font-bold prose-p:text-ink/80 prose-li:text-ink/80 max-w-3xl bg-white p-8 md:p-12 rounded-[32px] shadow-sm border border-black/5">
                <div dangerouslySetInnerHTML={{ __html: item.content }} />
            </article>

            {/* Footer Navigation */}
            <div className="mt-12 pt-8 border-t border-black/5 flex justify-between items-center text-sm opacity-50">
                <div>Reading: {item.title}</div>
                <div>(End of Article)</div>
            </div>
        </div>
    );
};

export default DetailView;
