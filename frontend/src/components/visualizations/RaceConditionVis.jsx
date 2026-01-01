import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Lock, Unlock, Database, Activity, RefreshCw } from 'lucide-react';

const RaceConditionVis = () => {
    // -- State --
    const [sharedValue, setSharedValue] = useState(0);
    const [mode, setMode] = useState('unsafe'); // 'unsafe' | 'mutex'
    const [delayTime, setDelayTime] = useState(1000);
    // Locked State (Visual + Logic)
    const [isLocked, setIsLocked] = useState(false);
    const lockRef = useRef(false); // Source of truth for logic to prevent race in the locking logic itself
    const [lockOwner, setLockOwner] = useState(null); // 'A' | 'B'

    // Thread States
    const [threadA, setThreadA] = useState({ state: 'idle', localVal: null, step: 0 }); // step: 0=idle, 1=read, 2=mod, 3=write
    const [threadB, setThreadB] = useState({ state: 'idle', localVal: null, step: 0 });

    const [history, setHistory] = useState([]); // Log of events

    // -- Logic --

    const startSimulation = () => {
        setSharedValue(0);
        setHistory([]);
        setThreadA({ state: 'idle', localVal: null, step: 0 });
        setThreadB({ state: 'idle', localVal: null, step: 0 });

        setIsLocked(false);
        lockRef.current = false;
        setLockOwner(null);

        // Launch Threads
        runThread('A', setThreadA);
        // Delay B slightly to make it interesting, or simultaneous
        setTimeout(() => runThread('B', setThreadB), 500);
    };

    const runThread = async (id, setThread) => {
        const updateThread = (updates) => setThread(prev => ({ ...prev, ...updates }));
        const log = (msg) => setHistory(prev => [...prev.slice(-4), `[Thread ${id}] ${msg}`]);

        // 1. ACQUIRE LOCK (If Safe Mode)
        if (mode === 'mutex') {
            updateThread({ state: 'locking' });
            log("Attempting lock...");

            // Spin/Wait logic visual
            while (true) {
                if (!lockRef.current) {
                    // Acquired!
                    lockRef.current = true;
                    setIsLocked(true);
                    setLockOwner(id);
                    log("Lock Acquired");
                    break;
                }
                // Wait
                await new Promise(r => setTimeout(r, 200));
            }
        }

        // 2. READ
        updateThread({ state: 'reading', step: 1 });
        log("Reading Shared Value...");

        // Simulating Fetch latency
        await new Promise(r => setTimeout(r, delayTime));

        // Actually read the CURRENT shared value (Simulate Stale Read risk)
        let currentVal;
        setSharedValue(v => { currentVal = v; return v; });
        updateThread({ localVal: currentVal, step: 2, state: 'computing' });
        log(`Read Value: ${currentVal}`);

        // 3. MODIFY (Simulate complex work)
        await new Promise(r => setTimeout(r, delayTime));
        const newVal = currentVal + 1;
        log(`Computed: ${currentVal} + 1 = ${newVal}`);

        // 4. WRITE
        updateThread({ step: 3, state: 'writing', localVal: newVal });
        await new Promise(r => setTimeout(r, delayTime));
        setSharedValue(newVal);
        log(`Wrote ${newVal} to Memory`);

        // 5. RELEASE (If Safe Mode)
        if (mode === 'mutex') {
            lockRef.current = false;
            setIsLocked(false);
            setLockOwner(null);
            log("Lock Released");
        }

        updateThread({ state: 'finished', step: 4 });
    };

    const reset = () => {
        setSharedValue(0);
        setHistory([]);
        setThreadA({ state: 'idle', localVal: null, step: 0 });
        setThreadB({ state: 'idle', localVal: null, step: 0 });
        setIsLocked(false);
        lockRef.current = false;
        setLockOwner(null);
    };

    return (
        <div className="w-full bg-[#0D0D0D] rounded-3xl p-6 flex flex-col gap-6 relative overflow-hidden font-manrope text-white min-h-[600px] border border-white/5 shadow-2xl">
            {/* Circuit Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
            />

            {/* Header Controls */}
            <div className="flex justify-between items-center z-20">
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    <button onClick={() => { setMode('unsafe'); reset(); }}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${mode === 'unsafe' ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'text-white/40 hover:text-white'}`}>
                        <Activity size={14} /> Unsafe (Race)
                    </button>
                    <button onClick={() => { setMode('mutex'); reset(); }}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${mode === 'mutex' ? 'bg-indigo-500/20 text-indigo-500 border border-indigo-500/50' : 'text-white/40 hover:text-white'}`}>
                        <Lock size={14} /> Safe (Mutex)
                    </button>
                </div>

                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                    <span className="text-xs text-indigo-400 font-bold uppercase">Op Delay</span>
                    <input type="range" min="200" max="2000" step="100" value={delayTime} onChange={e => setDelayTime(Number(e.target.value))} className="accent-indigo-500 h-1 w-24 bg-white/20 rounded-lg appearance-none" />
                </div>
            </div>

            {/* Main Stage */}
            <div className="flex-1 flex flex-col items-center justify-center relative gap-20 py-10 z-10">

                {/* Shared Memory Box */}
                <div className="relative">
                    <motion.div
                        animate={{
                            borderColor: isLocked ? '#6366f1' : '#ffffff30',
                            boxShadow: isLocked ? '0 0 30px rgba(99,102,241,0.3)' : 'none'
                        }}
                        className="w-48 h-32 bg-black/40 backdrop-blur-md rounded-2xl border-2 flex flex-col items-center justify-center relative z-20"
                    >
                        <div className="text-xs font-bold text-white/30 uppercase tracking-widest absolute top-4">Shared Count</div>
                        <div className="text-4xl font-mono font-bold text-white">{sharedValue}</div>

                        {/* Lock Icon */}
                        {mode === 'mutex' && (
                            <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-lg transition-colors ${isLocked ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-[#18181b] border-white/20 text-white/20'}`}>
                                {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                            </div>
                        )}
                    </motion.div>

                    {/* Circuit Traces */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-px h-full bg-white/10" />
                </div>


                {/* Threads Container */}
                <div className="flex justify-center gap-32 w-full max-w-2xl text-white">
                    {/* Thread A */}
                    <ThreadBlock id="A" data={threadA} color="cyan" />

                    {/* Thread B */}
                    <ThreadBlock id="B" data={threadB} color="magenta" />
                </div>

                {/* Result Message */}
                {(threadA.state === 'finished' && threadB.state === 'finished') && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`absolute bottom-10 px-6 py-3 rounded-full font-bold text-sm border ${sharedValue === 2 ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-red-500/20 text-red-400 border-red-500/50'}`}>
                        {sharedValue === 2 ? "Success! Correct Value (2)" : "Race Condition Detected! Lost Update (Value is 1)"}
                    </motion.div>
                )}
            </div>

            {/* Run Button */}
            <div className="absolute bottom-6 left-6 z-20">
                <button
                    onClick={startSimulation}
                    disabled={threadA.state !== 'idle' && threadA.state !== 'finished'}
                    className="bg-white text-black px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2 disabled:opacity-50 disabled:scale-100"
                >
                    {(threadA.state !== 'idle' && threadA.state !== 'finished') ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />}
                    Run Simulation
                </button>
            </div>

            {/* Log */}
            <div className="absolute top-20 right-6 w-64 flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {history.map((h, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="bg-black/80 px-3 py-2 rounded-lg text-xs font-mono text-white/70 border border-white/10 shadow-xl">
                            {h}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

        </div>
    );
};

// Sub-Component for Thread
const ThreadBlock = ({ id, data, color }) => {
    const isActive = data.state !== 'idle' && data.state !== 'finished';
    const highlight = color === 'cyan' ? '#06b6d4' : '#d946ef';

    return (
        <div className="flex flex-col items-center gap-4 relative">
            {/* Thread Core */}
            <div className={`w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-300 ${isActive ? `border-[${highlight}] bg-[${highlight}]/10 shadow-[0_0_20px_${highlight}40]` : 'border-white/10 bg-white/5'}`}
                style={{ borderColor: isActive ? highlight : 'rgba(255,255,255,0.1)' }}
            >
                <span className="text-sm font-bold opacity-50">Thread {id}</span>
                <div className="font-mono text-xl font-bold mt-1">
                    {data.localVal !== null ? `var=${data.localVal}` : '-'}
                </div>
            </div>

            {/* Status Badge */}
            <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                {data.state}
            </div>

            {/* Connection Line */}
            {isActive && (
                <svg className="absolute -top-20 left-1/2 -ml-[1px] h-20 w-[2px] overflow-visible">
                    <motion.line
                        x1="0" y1="100%" x2="0" y2="0"
                        stroke={highlight} strokeWidth="2" strokeDasharray="4 4"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                        transition={{ duration: 1, repeat: Infinity }}
                    />
                </svg>
            )}
        </div>
    )
}

export default RaceConditionVis;
