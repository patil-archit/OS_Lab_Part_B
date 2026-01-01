import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Ticket } from 'lucide-react';

const SemaphoreVis = () => {
    const [permits, setPermits] = useState(3);
    const [active, setActive] = useState([]);
    const [queue, setQueue] = useState([]);
    const [nextId, setNextId] = useState(1);

    const arrive = () => {
        const id = nextId;
        setNextId(prev => prev + 1);

        if (permits > 0) {
            setPermits(p => p - 1);
            setActive(prev => [...prev, id]);
        } else {
            setQueue(prev => [...prev, id]);
        }
    };

    const leave = (id) => {
        setActive(prev => prev.filter(x => x !== id));
        setPermits(p => p + 1);
    };

    // Safe Queue Processing Effect
    // When permits become available and queue has items, schedule the next admission.
    useEffect(() => {
        let timeout;
        if (permits > 0 && queue.length > 0) {
            // Identify who is next
            const nextId = queue[0];

            timeout = setTimeout(() => {
                // Perform the transition safely
                setPermits(p => p - 1);
                setQueue(q => q.slice(1));
                setActive(a => [...a, nextId]);
            }, 500);
        }
        return () => clearTimeout(timeout);
    }, [permits, queue]);

    return (
        <div className="w-full bg-black/5 rounded-3xl p-8 flex flex-col gap-8">
            {/* Controller */}
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-black/5">
                <div className="flex items-center gap-4">
                    <div className="bg-ink text-white w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl font-mono shadow-lg shadow-ink/20 transform transition-transform">
                        {permits}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-sm uppercase tracking-wider">Permits Available</span>
                        <span className="text-xs text-ink/60">Max Concurrency: 3</span>
                    </div>
                </div>
                <button
                    onClick={arrive}
                    className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-500/30"
                >
                    + New Process
                </button>
            </div>

            {/* Active Zone */}
            <div className="flex gap-4 min-h-[120px] bg-white/50 rounded-2xl p-4 border-2 border-dashed border-black/10 items-center justify-center relative">
                <span className="absolute top-2 left-4 text-[10px] font-bold uppercase tracking-widest text-ink/40">Critical Section (Active)</span>
                <AnimatePresence mode="popLayout">
                    {active.map(id => (
                        <motion.div
                            layout
                            key={id}
                            initial={{ scale: 0, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0, opacity: 0, y: -20 }}
                            onClick={() => leave(id)}
                            className="w-20 h-24 bg-white rounded-xl shadow-md border border-black/5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-red-500 hover:text-red-500 transition-colors group"
                        >
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
                                {id}
                            </div>
                            <span className="text-[10px] font-bold uppercase">Running</span>
                            <span className="text-[10px] text-ink/40 group-hover:text-red-500">Click to End</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {active.length === 0 && <span className="text-ink/20 text-sm font-medium">No active processes</span>}
            </div>

            {/* Queue Zone */}
            <div className="bg-gray-100 rounded-2xl p-4 flex flex-col gap-2 relative min-h-[80px]">
                <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-2">Waiting Queue</span>
                <div className="flex flex-wrap gap-2">
                    <AnimatePresence mode="popLayout">
                        {queue.map(id => (
                            <motion.div
                                layout
                                key={`q-${id}`}
                                initial={{ scale: 0.8, opacity: 0, x: -20 }}
                                animate={{ scale: 1, opacity: 1, x: 0 }}
                                exit={{ scale: 0.8, opacity: 0, x: 20 }}
                                className="px-3 py-1 bg-white rounded-lg border border-black/5 text-xs font-mono text-ink/60 shadow-sm flex items-center gap-2"
                            >
                                <Ticket size={12} />
                                Proc #{id}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {queue.length === 0 && <span className="text-ink/20 text-xs italic">Queue is empty</span>}
                </div>
            </div>
        </div>
    );
};

export default SemaphoreVis;
