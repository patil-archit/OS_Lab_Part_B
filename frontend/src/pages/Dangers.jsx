import React, { useState } from 'react';
import Section from '../components/Section';
import DetailView from '../components/DetailView';
import { dangersData } from '../data/osConcepts';

const Dangers = () => {
    const [selectedTopicId, setSelectedTopicId] = useState(null);
    const activeItem = dangersData.find(item => item.id === selectedTopicId);

    if (selectedTopicId && activeItem) {
        return <DetailView item={activeItem} onBack={() => setSelectedTopicId(null)} />;
    }

    return (
        <Section title="Concurrency Dangers">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {dangersData.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => setSelectedTopicId(item.id)}
                        className={`
                        p-8 rounded-[24px] flex flex-col justify-between min-h-[300px] cursor-pointer transition-transform hover:scale-[1.02] shadow-sm relative overflow-hidden group
                        ${item.id === 'deadlocks' ? 'bg-ink text-white md:col-span-2' : 'bg-white border border-black/10'}
                    `}
                    >
                        <item.icon className={`absolute -bottom-4 -right-4 w-40 h-40 opacity-10 pointer-events-none transition-transform group-hover:scale-110 duration-700 ${item.id === 'deadlocks' ? 'text-white' : 'text-ink'}`} />

                        <div className="flex items-start justify-between">
                            <h3 className="text-3xl font-bold mb-4">{item.title}</h3>
                            <span className="opacity-50 text-xl">↗</span>
                        </div>

                        <p className="opacity-80 text-lg leading-relaxed max-w-md z-10">
                            {item.description}
                        </p>

                        <div className="mt-8 flex gap-2">
                            <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest ${item.id === 'deadlocks' ? 'bg-white/20' : 'bg-black/5'}`}>
                                {item.subtitle}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </Section>
    );
};

export default Dangers;
