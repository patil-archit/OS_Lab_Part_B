import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Database, Eye, PenTool, AlertOctagon, Layers, Plus } from 'lucide-react';

const ReaderWriterVis = () => {
    // -- Visual State --
    const [visActors, setVisActors] = useState([]);
    const [visDbState, setVisDbState] = useState('idle');
    const [visActiveCount, setVisActiveCount] = useState(0);
    const [strategy, setStrategy] = useState('reader-pref'); // 'reader-pref' | 'writer-pref'

    // -- Logic State --
    const actorsRef = useRef([]); // { id, type, status: 'waiting'|'active' }
    const dbStateRef = useRef('idle'); // 'idle', 'reading', 'writing'
    const nextId = useRef(1);
    const timeouts = useRef([]);
    const schedulerRef = useRef(null);

    // Logic Loop
    useEffect(() => {
        schedulerRef.current = setInterval(scheduler, 200);
        return () => {
            clearInterval(schedulerRef.current);
            timeouts.current.forEach(clearTimeout);
        };
    }, [strategy]); // Restart if strategy changes

    const syncVisuals = () => {
        setVisActors([...actorsRef.current]);
        setVisDbState(dbStateRef.current);
        const active = actorsRef.current.filter(a => a.status === 'active');
        setVisActiveCount(active.length);
    };

    const scheduler = () => {
        const actors = actorsRef.current;
        const dbState = dbStateRef.current;

        const waiting = actors.filter(a => a.status === 'waiting');
        if (waiting.length === 0) return;

        // Rules:
        // 1. If Writing: NOBODY.
        if (dbState === 'writing') return;

        // 2. If Reading:
        if (dbState === 'reading') {
            if (strategy === 'writer-pref') {
                // If Writer Waiting, block new readers
                const writerWaiting = waiting.some(a => a.type === 'writer');
                if (writerWaiting) return;
            }

            // Allow Readers to join
            waiting.forEach((a, i) => {
                if (a.type === 'reader') {
                    setTimeout(() => activateActor(a.id), i * 150);
                }
            });
            return;
        }

        // 3. If Idle:
        if (dbState === 'idle') {
            // Check Head of Queue logic? 
            // We'll iterate and find first eligible.

            // If Writer Pref: Prioritize Writer if exists anywhere in queue? 
            // Or just block readers until writer handled?
            // Strict Writer Pref: If Writer waiting, NO Reader starts.
            const writerWaiting = waiting.some(a => a.type === 'writer');

            if (strategy === 'writer-pref' && writerWaiting) {
                // Find the writer
                const writer = waiting.find(a => a.type === 'writer');
                if (writer) activateActor(writer.id);
                return;
            }

            // Otherwise, normal FIFO or Reader batching
            const head = waiting[0];
            if (head.type === 'reader') {
                // Activate ALL waiting readers (Mass wake up) - or just head? 
                // Readers usually can batch join.
                waiting.forEach((a, i) => {
                    if (a.type === 'reader') {
                        // Stagger activation for visual "fan out" effect
                        setTimeout(() => activateActor(a.id), i * 150);
                    }
                });
            } else {
                // Writer
                activateActor(head.id);
            }
        }
    };

    const activateActor = (id) => {
        const actors = actorsRef.current;
        const actor = actors.find(a => a.id === id);
        if (!actor || actor.status === 'active') return;

        // Update logic
        actor.status = 'active';

        if (actor.type === 'writer') {
            dbStateRef.current = 'writing';
        } else {
            dbStateRef.current = 'reading';
        }

        syncVisuals();

        // Schedule finish
        const t = setTimeout(() => finishActor(id), 2500);
        timeouts.current.push(t);
    };

    const finishActor = (id) => {
        // Remove from list
        actorsRef.current = actorsRef.current.filter(a => a.id !== id);

        // Recalculate DB State
        const active = actorsRef.current.filter(a => a.status === 'active');
        if (active.length === 0) {
            dbStateRef.current = 'idle';
        } else {
            // Must still be readers
            dbStateRef.current = 'reading';
        }

        syncVisuals();
    };

    const addActor = (type) => {
        const newActor = {
            id: nextId.current++,
            type,
            status: 'waiting'
        };
        actorsRef.current.push(newActor);
        syncVisuals();
    };

    const reset = () => {
        actorsRef.current = [];
        dbStateRef.current = 'idle';
        timeouts.current.forEach(clearTimeout);
        timeouts.current = [];
        syncVisuals();
    };

    // -- Visuals --
    return (
        <div className="w-full bg-[#0a0f1c] rounded-3xl p-6 flex flex-col gap-8 relative overflow-hidden font-manrope text-white min-h-[500px] border border-white/5 shadow-2xl select-none">
            {/* Cyber Grid */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            {/* Header */}
            <div className="flex justify-between items-center z-20">
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    <button onClick={() => { setStrategy('reader-pref'); reset(); }}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${strategy === 'reader-pref' ? 'bg-sky-500/20 text-sky-500 border border-sky-500/50' : 'text-white/40 hover:text-white'}`}>
                        <Eye size={14} /> Reader Pref
                    </button>
                    <button onClick={() => { setStrategy('writer-pref'); reset(); }}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${strategy === 'writer-pref' ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'text-white/40 hover:text-white'}`}>
                        <PenTool size={14} /> Writer Pref
                    </button>
                </div>

                <div onClick={reset} className="cursor-pointer text-white/30 hover:text-white transition"><RotateCcw size={18} /></div>
            </div>

            {/* Main Stage */}
            <div className="flex-1 flex flex-col items-center justify-center gap-16 z-10 relative">

                {/* Wait Queue */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 -rotate-90 absolute -left-8 top-1/2">Wait Queue</div>
                    <AnimatePresence>
                        {visActors.filter(a => a.status === 'waiting').map(a => (
                            <motion.div
                                key={a.id}
                                layoutId={a.id}
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 50, opacity: 0 }}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 shadow-lg ${a.type === 'writer' ? 'bg-red-500 text-white border-red-400' : 'bg-sky-500 text-white border-sky-400'}`}
                            >
                                {a.type === 'writer' ? <PenTool size={16} /> : <Eye size={16} />}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {visActors.filter(a => a.status === 'waiting').length === 0 && (
                        <div className="w-10 h-10 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center">
                            <span className="text-xs text-white/20">Empty</span>
                        </div>
                    )}
                </div>

                {/* Central DB Hub */}
                <div className="relative w-40 h-40">
                    {/* Halo */}
                    <div className={`absolute inset-0 rounded-full blur-2xl transition-all duration-500 ${visDbState === 'writing' ? 'bg-red-500/30' : visDbState === 'reading' ? 'bg-sky-500/30' : 'bg-white/5'}`} />

                    {/* Core */}
                    <div className={`relative w-full h-full rounded-2xl border-2 backdrop-blur-md flex flex-col items-center justify-center shadow-2xl transition-all duration-300 ${visDbState === 'writing' ? 'bg-red-500/10 border-red-500 text-red-100' : visDbState === 'reading' ? 'bg-sky-500/10 border-sky-500 text-sky-100' : 'bg-black/40 border-white/10 text-white/40'}`}>
                        <Database size={48} className={`mb-2 ${visDbState === 'writing' ? 'animate-bounce' : visDbState === 'reading' ? 'animate-pulse' : ''}`} />
                        <div className="text-xs font-bold uppercase tracking-widest">{visDbState}</div>
                        <div className="text-[10px] opacity-60 mt-1">{visActiveCount} Active</div>
                    </div>
                </div>

                {/* Active Ring */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <AnimatePresence>
                        {visActors.filter(a => a.status === 'active').map((a, i, arr) => {
                            const angle = (i * (360 / arr.length)) - 90;
                            const rad = (angle * Math.PI) / 180;
                            const radius = 160;
                            const x = Math.cos(rad) * radius;
                            const y = Math.sin(rad) * radius;

                            return (
                                <React.Fragment key={a.id}>
                                    {/* Beam */}
                                    <svg className="absolute inset-0 w-full h-full overflow-visible">
                                        <motion.line
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            exit={{ pathLength: 0 }}
                                            x1="50%" y1="50%"
                                            x2={`calc(50% + ${x}px)`} y2={`calc(50% + ${y}px)`}
                                            stroke={a.type === 'writer' ? '#ef4444' : '#0ea5e9'}
                                            strokeWidth={a.type === 'writer' ? 4 : 2}
                                            strokeDasharray={a.type === 'writer' ? '' : '4 4'}
                                            className="drop-shadow-[0_0_8px_currentColor]"
                                        />
                                    </svg>

                                    {/* Actor Node */}
                                    <motion.div
                                        layoutId={a.id}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        className={`absolute w-12 h-12 rounded-xl border-2 flex items-center justify-center shadow-[0_0_20px_currentColor] ${a.type === 'writer' ? 'bg-red-500 border-red-300 text-white shadow-red-500/50' : 'bg-sky-500 border-sky-300 text-white shadow-sky-500/50'}`}
                                        style={{ transform: `translate(${x}px, ${y}px)` }}
                                    >
                                        {a.type === 'writer' ? <PenTool size={20} /> : <Eye size={20} />}
                                    </motion.div>
                                </React.Fragment>
                            );
                        })}
                    </AnimatePresence>
                </div>

            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4 z-20">
                <button onClick={() => addActor('reader')} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/20 active:scale-95 transition-all">
                    <Plus size={18} /> Add Reader
                </button>
                <button onClick={() => addActor('writer')} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/20 active:scale-95 transition-all">
                    <Plus size={18} /> Add Writer
                </button>
            </div>

            {/* Explanation Toast */}
            <div className="absolute bottom-6 left-6 max-w-xs text-[10px] text-white/30 leading-relaxed font-mono">
                {strategy === 'reader-pref'
                    ? "Reader Pref: New Readers skip waiting Writers if DB is already reading."
                    : "Writer Pref: New Readers must wait if a Writer is waiting."}
            </div>

        </div>
    );
};

export default ReaderWriterVis;
