import React, { useState } from 'react';
import Section from '../components/Section';
import DetailView from '../components/DetailView';
import { classicProblems } from '../data/problems';

const Scenarios = () => {
    const [selectedTopicId, setSelectedTopicId] = useState(null);
    const activeItem = classicProblems.find(item => item.id === selectedTopicId);

    if (selectedTopicId && activeItem) {
        return <DetailView item={activeItem} onBack={() => setSelectedTopicId(null)} />;
    }

    return (
        <Section title="Classic Problems">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {classicProblems.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => setSelectedTopicId(item.id)}
                        className="aspect-square rounded-[40px] bg-gray-50 hover:bg-white border-4 border-transparent hover:border-ink/5 p-10 flex flex-col justify-between cursor-pointer transition-all hover:shadow-xl group"
                    >
                        <div className="flex justify-between items-start">
                            <item.icon size={48} className="text-ink/80" />
                            <span className="px-4 py-1 rounded-full border border-black/10 text-xs font-bold uppercase tracking-widest">{item.subtitle}</span>
                        </div>

                        <div>
                            <h3 className="text-4xl font-bold mb-4 group-hover:underline decoration-4 decoration-ink/20 underline-offset-4">{item.title}</h3>
                            <p className="text-ink/60 text-lg leading-relaxed">{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Section>
    );
};

export default Scenarios;
