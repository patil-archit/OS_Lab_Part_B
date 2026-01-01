import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, Clock, ChevronsUp, User, Zap, RefreshCw, AlertCircle } from 'lucide-react';

const StarvationVis = () => {
    // -- State --
    const [tasks, setTasks] = useState([]); // { id, type: 'high'|'low', age: 0, createdAt, originalType }
    const [processing, setProcessing] = useState(null);
    const [mode, setMode] = useState('unfair'); // 'unfair' | 'aging'
    const [agingSpeed, setAgingSpeed] = useState(1);
    const [autoAdd, setAutoAdd] = useState(false);

    const nextId = useRef(1);
    const timeouts = useRef([]);
    const interval = useRef(null);

    // -- Lifecycle --
    useEffect(() => {
        // Initial Population
        reset();
        return () => {
            timeouts.current.forEach(clearTimeout);
            clearInterval(interval.current);
        };
    }, []);

    useEffect(() => {
        if (autoAdd) {
            const id = setInterval(() => {
                // 70% chance of High Priority to cause starvation
                const type = Math.random() > 0.3 ? 'high' : 'low';
                addTask(type);
            }, 1500);
            interval.current = id;
        } else {
            clearInterval(interval.current);
        }
        return () => clearInterval(interval.current);
    }, [autoAdd]);

    // -- Logic --
    const reset = () => {
        setTasks([]);
        setProcessing(null);
        nextId.current = 1;
        setAutoAdd(false);
    };

    const addTask = (type) => {
        const newTask = {
            id: nextId.current++,
            type,
            originalType: type, // To show "Boosted" status later
            age: 0,
            createdAt: Date.now()
        };

        setTasks(prev => {
            // Add to pool. We will sort later.
            return [...prev, newTask];
        });
    };

    // Processor Loop
    useEffect(() => {
        if (processing) return; // Busy

        const nextTask = getNextTask();
        if (nextTask) {
            processTask(nextTask);
        }
    }, [tasks, processing]); // Re-check when tasks change or processor frees up

    // Aging Loop
    useEffect(() => {
        if (mode === 'unfair') return;

        const tick = setInterval(() => {
            setTasks(prev => prev.map(t => {
                if (t.type === 'high') return t; // High don't age

                const newAge = t.age + (5 * agingSpeed);
                if (newAge >= 100) {
                    // PROMOTE!
                    // When promoting, we update 'createdAt' to now() to ensure they join 
                    // the END of the high priority queue, not jump to front (User Request).
                    // Actually, strictly speaking, they join the end of the high prio line.
                    return { ...t, type: 'high', age: 100, createdAt: Date.now(), isBoosted: true };
                }
                return { ...t, age: newAge };
            }));
        }, 100);

        return () => clearInterval(tick);
    }, [mode, agingSpeed]);


    const getNextTask = () => {
        if (tasks.length === 0) return null;

        // Sort logic
        // 1. High Priority first
        // 2. FIFO (createdAt) within same priority
        const sorted = [...tasks].sort((a, b) => {
            if (a.type !== b.type) {
                return a.type === 'high' ? -1 : 1;
            }
            return a.createdAt - b.createdAt;
        });
        return sorted[0];
    };

    const processTask = (task) => {
        setProcessing(task);
        setTasks(prev => prev.filter(t => t.id !== task.id));

        // Fake work
        const id = setTimeout(() => {
            setProcessing(null);
        }, 1000); // 1s per task
        timeouts.current.push(id);
    };

    // -- Render Helpers --
    // Separate queues for display purposes, though logic uses one list
    const highPrio = tasks.filter(t => t.type === 'high').sort((a, b) => a.createdAt - b.createdAt);
    const lowPrio = tasks.filter(t => t.type === 'low').sort((a, b) => a.createdAt - b.createdAt);

    return (
        <div className="w-full bg-[#0D0D0D] rounded-3xl p-6 flex flex-col gap-6 relative overflow-hidden font-manrope text-white min-h-[600px] border border-white/5 shadow-2xl">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

            {/* Header / Mode */}
            <div className="flex justify-between items-center z-20">
                <div className="flex gap-2">
                    <button onClick={() => { setMode('unfair'); reset(); }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${mode === 'unfair' ? 'bg-red-500/10 border-red-500 text-red-500' : 'border-transparent text-white/40 hover:bg-white/5'}`}>
                        Unfair (Starvation)
                    </button>
                    <button onClick={() => { setMode('aging'); reset(); }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${mode === 'aging' ? 'bg-blue-500/10 border-blue-500 text-blue-500' : 'border-transparent text-white/40 hover:bg-white/5'}`}>
                        Aging (Fair)
                    </button>
                </div>

                {/* Aging Speed Controls */}
                {mode === 'aging' && (
                    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                        <span className="text-xs text-blue-400 font-bold uppercase">Aging Speed</span>
                        <input type="range" min="1" max="5" step="1" value={agingSpeed} onChange={e => setAgingSpeed(Number(e.target.value))} className="accent-blue-500 h-1 w-20 bg-white/20 rounded-lg appearance-none" />
                    </div>
                )}
            </div>

            {/* Main Vis Area */}
            <div className="flex-1 flex flex-col md:flex-row gap-6 z-10">

                {/* Queues */}
                <div className="flex-1 flex flex-col gap-4">

                    {/* High Priority Queue */}
                    <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.05)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={60} /></div>
                        <h3 className="text-sm font-bold text-indigo-400 mb-4 flex items-center gap-2 relative z-10"><ChevronsUp size={16} /> High Priority Queue</h3>
                        <div className="flex flex-wrap content-start gap-2 relative z-10 min-h-[100px]">
                            <AnimatePresence>
                                {highPrio.map(t => (
                                    <motion.div
                                        layoutId={t.id}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        key={t.id}
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shadow-lg ${t.isBoosted ? 'bg-indigo-500 text-white border-2 border-yellow-400' : 'bg-indigo-600 text-white'}`}
                                    >
                                        {t.id}
                                        {t.isBoosted && <motion.div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full" />}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Low Priority Queue */}
                    <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5"><User size={60} /></div>
                        <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2 relative z-10"><User size={16} /> Low Priority Queue</h3>
                        <div className="flex flex-wrap content-start gap-2 relative z-10 min-h-[100px]">
                            <AnimatePresence>
                                {lowPrio.map(t => (
                                    <motion.div
                                        layoutId={t.id}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        key={t.id}
                                        className="w-12 h-12 rounded-xl bg-gray-700 text-gray-300 flex items-center justify-center font-bold text-sm relative overflow-hidden"
                                    >
                                        <span className="relative z-10">{t.id}</span>
                                        {/* Aging Progress Overlay */}
                                        <motion.div
                                            className="absolute bottom-0 left-0 right-0 bg-blue-500/30"
                                            style={{ height: `${t.age}%` }}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                        {/* Starvation Warning */}
                        {mode === 'unfair' && lowPrio.length > 5 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute bottom-4 right-4 flex items-center gap-2 text-red-400 text-xs font-bold bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                                <AlertCircle size={12} /> Starvation Risk High
                            </motion.div>
                        )}
                    </div>

                </div>

                {/* CPU */}
                <div className="w-full md:w-64 flex flex-col gap-4">
                    <div className="h-40 bg-black/40 rounded-2xl border border-white/10 flex flex-col items-center justify-center relative backdrop-blur-sm">
                        <span className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2">CPU Core</span>
                        <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center relative">
                            <AnimatePresence mode="wait">
                                {processing ? (
                                    <motion.div
                                        key={processing.id}
                                        layoutId={processing.id}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
                                        className={`w-16 h-16 rounded-xl flex items-center justify-center font-bold text-lg shadow-[0_0_30px_currentColor] ${processing.type === 'high' ? 'bg-indigo-500 text-white' : 'bg-gray-600 text-white'}`}
                                    >
                                        {processing.id}
                                    </motion.div>
                                ) : (
                                    <span className="text-xs text-white/20">Idle</span>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Manual Add Controls */}
                    <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col gap-2">
                        <div className="text-xs font-bold text-white/40 mb-2 uppercase">Task Generator</div>
                        <button onClick={() => addTask('high')} className="flex items-center justify-between p-3 rounded-xl bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition border border-indigo-500/30">
                            <span className="text-sm font-bold">Add High Prio</span>
                            <Plus size={16} />
                        </button>
                        <button onClick={() => addTask('low')} className="flex items-center justify-between p-3 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 transition border border-white/5">
                            <span className="text-sm font-bold">Add Low Prio</span>
                            <Plus size={16} />
                        </button>

                        <div className="h-px bg-white/10 my-2" />

                        <button onClick={() => setAutoAdd(!autoAdd)}
                            className={`flex items-center justify-center gap-2 p-3 rounded-xl font-bold text-xs transition border ${autoAdd ? 'bg-red-500 text-white border-red-600 animate-pulse' : 'bg-green-600 text-white border-green-700'}`}>
                            {autoAdd ? 'Stop Traffic' : 'Auto-Generate Traffic'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StarvationVis;
