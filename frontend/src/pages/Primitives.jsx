import React, { useState } from 'react';
import Section from '../components/Section';
import DetailView from '../components/DetailView';
import { primitivesData } from '../data/osConcepts';

const Primitives = () => {
    const [selectedTopicId, setSelectedTopicId] = useState(null);
    const activeItem = primitivesData.find(item => item.id === selectedTopicId);

    if (selectedTopicId && activeItem) {
        return <DetailView item={activeItem} onBack={() => setSelectedTopicId(null)} />;
    }

    return (
        <Section title="Synchronization Primitives">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {primitivesData.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => setSelectedTopicId(item.id)}
                        className="group p-8 rounded-[32px] bg-white border border-black/5 hover:border-black/10 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer flex flex-col gap-4 relative overflow-hidden"
                    >
                        <div className="flex justify-between items-start z-10">
                            <div className="p-3 bg-gray-50 rounded-xl shadow-sm text-ink/60 group-hover:text-ink transition-colors">
                                <item.icon size={28} />
                            </div>
                            <span className="text-ink/20 group-hover:text-ink/60 transition-colors text-2xl">↗</span>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                            <p className="text-ink/60 leading-relaxed">{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Section>
    );
};

export default Primitives;
