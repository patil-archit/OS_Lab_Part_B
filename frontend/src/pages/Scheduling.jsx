import React, { useState } from 'react';
import Section from '../components/Section';
import DetailView from '../components/DetailView';
import { schedulingAlgorithms } from '../data/scheduling';

const Scheduling = () => {
    const [selectedTopicId, setSelectedTopicId] = useState(null);
    const activeItem = schedulingAlgorithms.find(item => item.id === selectedTopicId);

    if (selectedTopicId && activeItem) {
        return <DetailView item={activeItem} onBack={() => setSelectedTopicId(null)} />;
    }

    return (
        <Section title="CPU Scheduling">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {schedulingAlgorithms.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => setSelectedTopicId(item.id)}
                        className="p-10 rounded-[32px] bg-white border border-black/5 hover:border-black/10 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between min-h-[320px] relative overflow-hidden group"
                    >
                        {/* Background Icon Decoration */}
                        <item.icon className="absolute -bottom-8 -right-8 w-48 h-48 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-500 group-hover:scale-110 text-black" />

                        <div className="flex justify-between items-start z-10">
                            <div className="p-4 bg-gray-50 rounded-2xl text-ink group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                <item.icon size={32} />
                            </div>
                            <span className="px-4 py-2 rounded-full border border-black/5 text-xs font-bold uppercase tracking-widest bg-white/50 backdrop-blur-sm">
                                {item.subtitle}
                            </span>
                        </div>

                        <div className="z-10 mt-8">
                            <div className="flex items-center gap-3 mb-3">
                                <h3 className="text-3xl font-bold text-ink">{item.title}</h3>
                                <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                                    <span className="text-lg">↗</span>
                                </div>
                            </div>

                            <p className="text-lg text-ink/60 leading-relaxed font-medium">
                                {item.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </Section>
    );
};

export default Scheduling;
