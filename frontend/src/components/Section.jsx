import React from 'react';

const Section = ({ title, children, className = "" }) => {
    return (
        <section className={`mb-8 ${className}`}>
            {title && (
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-6 px-2">
                    {title}
                </h2>
            )}

            <div className="bg-white rounded-[32px] p-6 md:p-10 shadow-sm border border-black/5 hover:border-black/10 transition-colors">
                {children}
            </div>
        </section>
    );
};

export default Section;
