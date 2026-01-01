import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, ShieldCheck, AlertTriangle, Zap, Settings, Plus, Minus, Scroll } from 'lucide-react';

const DeadlockVis = () => {
    // -- State --
    const [nodeCount, setNodeCount] = useState(2); // Simplified default
    const [speed, setSpeed] = useState(1);
    const [mode, setMode] = useState('chaos'); // 'chaos' | 'ordered'
    const [simState, setSimState] = useState('idle'); // 'idle', 'running', 'deadlocked', 'success'

    // Track resource ownership: resourceIndex -> ownerNodeIndex (or null)
    const [resources, setResources] = useState({});
    // Track node status: nodeIndex -> 'thinking' | 'hungry' | 'eating' | 'done' | 'deadlocked'
    const [nodeStatus, setNodeStatus] = useState({});
    // Track active request lines (node -> resource)
    const [requests, setRequests] = useState([]);

    // Logs
    const [logs, setLogs] = useState([]);

    const timeouts = useRef([]);

    // -- Helpers --
    const getLeftResource = (i) => i;
    const getRightResource = (i) => (i + 1) % nodeCount;
    const delay = (ms) => new Promise(res => {
        const id = setTimeout(res, ms / speed);
        timeouts.current.push(id);
    });

    const addLog = (msg) => {
        setLogs(prev => [msg, ...prev].slice(0, 5)); // Keep last 5
    };

    // -- Lifecycle --
    useEffect(() => {
        reset();
    }, [nodeCount, mode]);

    useEffect(() => {
        return () => timeouts.current.forEach(clearTimeout);
    }, []);

    const reset = () => {
        timeouts.current.forEach(clearTimeout);
        timeouts.current = [];
        setSimState('idle');
        setResources(Array(nodeCount).fill(null).map(() => null));
        setNodeStatus(Array(nodeCount).fill('thinking').reduce((acc, val, i) => ({ ...acc, [i]: val }), {}));
        setRequests([]);
        setLogs([]);
    };

    // -- Simulation Logic --
    const runSimulation = async () => {
        reset();
        setSimState('running');
        addLog("Starting simulation...");

        // Launch all nodes concurrently
        const promises = Array(nodeCount).fill(0).map((_, i) => runNode(i));

        // Monitor for Deadlock or All Done
        await Promise.all(promises);
    };

    const runNode = async (i) => {
        // Thinking
        setNodeStatus(prev => ({ ...prev, [i]: 'thinking' }));
        // addLog(`P${i} is thinking...`);
        await delay(500 + Math.random() * 500);

        setNodeStatus(prev => ({ ...prev, [i]: 'hungry' }));
        addLog(`P${i} is hungry! Needs R${getLeftResource(i)} & R${getRightResource(i)}`);

        // Define Resources
        const r1 = getLeftResource(i);
        const r2 = getRightResource(i);

        // -- ACQUISITION STRATEGY --
        let first, second;

        if (mode === 'chaos') {
            // Chaos: Always Left then Right (Circular Wait prone)
            first = r1;
            second = r2;
        } else {
            // Ordered: Always Lower ID then Higher ID (Hierarchy Solution)
            first = Math.min(r1, r2);
            second = Math.max(r1, r2);
        }

        // Try Acquire First
        await acquireResource(i, first);

        // Try Acquire Second
        // In Chaos Mode, this is where we deadlock
        await acquireResource(i, second);

        // EATING
        setNodeStatus(prev => ({ ...prev, [i]: 'eating' }));
        addLog(`P${i} is EATING!`);
        await delay(1500); // Chew

        // RELEASE
        releaseResource(i, first);
        releaseResource(i, second);
        addLog(`P${i} released resources.`);

        setNodeStatus(prev => ({ ...prev, [i]: 'done' }));

        // Check Success
        checkCompletion();
    };

    const acquireResource = async (nodeIdx, resIdx) => {
        // Visualize Intent
        setRequests(prev => [...prev, { node: nodeIdx, res: resIdx }]);
        addLog(`P${nodeIdx} requesting R${resIdx}...`);

        await delay(300); // Visual delay for request travel

        let acquired = false;
        let attempts = 0;

        while (!acquired) {
            setResources(prev => {
                if (prev[resIdx] === null) {
                    acquired = true;
                    // addLog(`P${nodeIdx} ACQUIRED R${resIdx}`);
                    const next = [...prev];
                    next[resIdx] = nodeIdx;
                    return next;
                }
                return prev;
            });

            if (acquired) {
                // Success! Remove request line
                setRequests(prev => prev.filter(r => !(r.node === nodeIdx && r.res === resIdx)));
                return;
            }

            // Failed to acquire. 
            attempts++;
            if (attempts % 5 === 0 && attempts < 15) {
                addLog(`P${nodeIdx} waiting for R${resIdx}...`);
            }

            if (mode === 'chaos' && attempts > 15) {
                // Likely Deadlocked. 
                setSimState('deadlocked');
                setNodeStatus(prev => {
                    const next = { ...prev };
                    Object.keys(next).forEach(k => {
                        if (next[k] === 'hungry') next[k] = 'deadlocked';
                    });
                    return next;
                });
                addLog(`DEADLOCK DETECTED! System frozen.`);
                return new Promise(() => { }); // Never resolve
            }

            await delay(200);
        }
    };

    const releaseResource = (nodeIdx, resIdx) => {
        setResources(prev => {
            const next = [...prev];
            if (next[resIdx] === nodeIdx) next[resIdx] = null;
            return next;
        });
    };

    const checkCompletion = () => {
        // If all done
        setNodeStatus(prev => {
            const allDone = Object.values(prev).every(s => s === 'done');
            if (allDone) {
                setSimState('success');
                addLog("All processes completed successfully!");
            }
            return prev;
        });
    };


    // -- Rendering --
    const radius = 100; // Slightly smaller to fit logs
    const center = { x: 160, y: 160 };

    return (
        <div className="w-full bg-[#0D0D0D] rounded-3xl p-6 flex flex-col items-center relative overflow-hidden font-manrope text-white min-h-[600px] border border-white/5 shadow-2xl">

            {/* Background Grid */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            />
            {/* Log Panel - Absolute Positioned or Grid */}
            <div className="absolute top-4 right-4 z-20 w-48 pointer-events-none">
                <div className="flex flex-col gap-1 items-end">
                    {logs.map((log, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1 - i * 0.15, x: 0 }}
                            className="text-[10px] font-mono bg-black/40 px-2 py-1 rounded border border-white/5 text-right"
                        >
                            {log}
                        </motion.div>
                    ))}
                </div>
            </div>


            {/* Header Controls */}
            <div className="w-full flex justify-between items-start z-20 mb-8">
                <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
                    <button onClick={() => { setMode('chaos'); reset(); }}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${mode === 'chaos' ? 'bg-red-500/20 text-red-500 border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'text-white/40 hover:text-white'}`}>
                        <AlertTriangle size={14} /> Chaos
                    </button>
                    <button onClick={() => { setMode('ordered'); reset(); }}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${mode === 'ordered' ? 'bg-green-500/20 text-green-500 border border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'text-white/40 hover:text-white'}`}>
                        <ShieldCheck size={14} /> Ordered
                    </button>
                </div>

                <div className="flex flex-col gap-2 items-end">
                    <div className="flex items-center gap-4 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                        <span className="text-xs text-white/50 font-bold uppercase tracking-wider">Speed</span>
                        <input type="range" min="0.5" max="3" step="0.5" value={speed} onChange={e => setSpeed(Number(e.target.value))} className="accent-indigo-500 h-1 w-20 bg-white/20 rounded-lg appearance-none cursor-pointer" />
                        <span className="text-xs font-mono w-8 text-right">{speed}x</span>
                    </div>
                </div>
            </div>

            {/* Visualization Stage */}
            <div className="relative w-80 h-80 flex-shrink-0 z-10">
                {/* Center Status Pulse */}
                <div className={`absolute inset-0 m-auto w-40 h-40 rounded-full blur-[50px] transition-colors duration-1000 ${simState === 'deadlocked' ? 'bg-red-600/30' : simState === 'success' ? 'bg-green-600/30' : 'bg-blue-600/10'}`} />

                {/* Nodes & Resources */}
                {Array.from({ length: nodeCount }).map((_, i) => {
                    const angle = (i * (360 / nodeCount)) - 90; // Start top
                    const rad = (angle * Math.PI) / 180;
                    const x = center.x + Math.cos(rad) * radius;
                    const y = center.y + Math.sin(rad) * radius; // 120 radius for nodes

                    // Resource is between i and i+1
                    const resAngle = angle + (360 / nodeCount / 2);
                    const resRad = (resAngle * Math.PI) / 180;
                    const rx = center.x + Math.cos(resRad) * (radius * 0.6); // Closer to center
                    const ry = center.y + Math.sin(resRad) * (radius * 0.6);

                    // Resource Owner
                    const resOwner = resources[i];
                    const isOwned = resOwner !== null && resOwner !== undefined;

                    // Calculate line from owner to resource
                    let lineProps = null;
                    if (isOwned) {
                        const ownerAngle = (resOwner * (360 / nodeCount)) - 90;
                        const ownerRad = (ownerAngle * Math.PI) / 180;
                        const ox = center.x + Math.cos(ownerRad) * radius;
                        const oy = center.y + Math.sin(ownerRad) * radius;
                        lineProps = { x1: ox, y1: oy, x2: rx, y2: ry, color: '#22c55e' }; // Green owned
                    }

                    // Calculate request lines
                    const myRequests = requests.filter(r => r.node === i);

                    return (
                        <React.Fragment key={i}>
                            {/* Owned Lines (Solid) */}
                            {lineProps && (
                                <svg className="absolute inset-0 pointer-events-none w-full h-full overflow-visible">
                                    <motion.line
                                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                                        x1={lineProps.x1} y1={lineProps.y1} x2={lineProps.x2} y2={lineProps.y2}
                                        stroke={lineProps.color} strokeWidth="2" strokeLinecap="round"
                                        className="drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]"
                                    />
                                </svg>
                            )}

                            {/* Request Lines (Dashed/Animated) */}
                            {myRequests.map((req, ridx) => {
                                const targetResIdx = req.res;
                                // Calc target coords
                                const tAngle = (targetResIdx * (360 / nodeCount) - 90) + (360 / nodeCount / 2);
                                const tRad = (tAngle * Math.PI) / 180;
                                const tx = center.x + Math.cos(tRad) * (radius * 0.6);
                                const ty = center.y + Math.sin(tRad) * (radius * 0.6);

                                return (
                                    <svg key={`req-${ridx}`} className="absolute inset-0 pointer-events-none w-full h-full overflow-visible">
                                        <motion.line
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 1 }}
                                            x1={x} y1={y} x2={tx} y2={ty}
                                            stroke={simState === 'deadlocked' ? '#ef4444' : '#fbbf24'}
                                            strokeWidth="2" strokeDasharray="4 4"
                                            className={simState === 'deadlocked' ? "drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" : ""}
                                        />
                                        {/* Waiting Icon on Line */}
                                        <motion.circle
                                            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                                            cx={x + (tx - x) / 2} cy={y + (ty - y) / 2} r="6" fill="#1e1e24" stroke="#fbbf24" strokeWidth="2"
                                        />
                                    </svg>
                                )
                            })}

                            {/* Resource Orb */}
                            <motion.div
                                animate={{
                                    scale: isOwned ? 1.2 : 1,
                                    backgroundColor: isOwned ? '#22c55e' : '#3f3f46',
                                    borderColor: isOwned ? '#4ade80' : '#52525b'
                                }}
                                className="absolute w-8 h-8 rounded-full border-2 z-20 flex items-center justify-center -ml-4 -mt-4 shadow-lg text-[10px] font-bold text-white/50"
                                style={{ left: rx, top: ry }}
                            >
                                R{i}
                            </motion.div>

                            {/* Node Circle */}
                            <motion.div
                                layout
                                animate={{
                                    scale: nodeStatus[i] === 'eating' ? 1.1 : 1,
                                    backgroundColor: nodeStatus[i] === 'deadlocked' ? '#ef4444' : nodeStatus[i] === 'eating' ? '#22c55e' : nodeStatus[i] === 'done' ? '#10b981' : '#18181b', // Red, Green, Teal, Dark
                                    borderColor: nodeStatus[i] === 'deadlocked' ? '#f87171' : nodeStatus[i] === 'eating' ? '#4ade80' : nodeStatus[i] === 'hungry' ? '#facc15' : '#27272a',
                                    boxShadow: nodeStatus[i] === 'eating' ? '0 0 20px rgba(34,197,94,0.5)' : nodeStatus[i] === 'deadlocked' ? '0 0 20px rgba(239,68,68,0.5)' : 'none'
                                }}
                                className="absolute w-16 h-16 rounded-full border-2 z-30 flex items-center justify-center -ml-8 -mt-8 shadow-xl"
                                style={{ left: x, top: y }}
                            >
                                <div className="flex flex-col items-center">
                                    <span className="font-bold text-sm">P{i}</span>
                                    {nodeStatus[i] === 'waiting' && <span className="text-[9px] translate-y-[-2px] text-yellow-500">WAIT</span>}
                                </div>
                                {nodeStatus[i] === 'eating' && <motion.div layoutId="eating-glow" className="absolute inset-0 rounded-full border-2 border-white/50 animate-ping" />}
                            </motion.div>
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Controls */}
            <div className="w-full mt-auto p-6 bg-white/5 rounded-2xl border border-white/10 flex flex-col gap-4">

                {/* Node Slider */}
                <div className="flex justify-between items-center">
                    <div className="text-white/60 text-sm font-medium">Process Count</div>
                    <div className="flex items-center gap-3 bg-black/20 p-1 rounded-lg">
                        <button disabled={nodeCount <= 2 || simState !== 'idle'} onClick={() => setNodeCount(c => c - 1)} className="p-2 hover:bg-white/10 rounded-md disabled:opacity-30 transition"><Minus size={14} /></button>
                        <span className="w-4 text-center text-sm font-mono">{nodeCount}</span>
                        <button disabled={nodeCount >= 5 || simState !== 'idle'} onClick={() => setNodeCount(c => c + 1)} className="p-2 hover:bg-white/10 rounded-md disabled:opacity-30 transition"><Plus size={14} /></button>
                    </div>
                </div>

                {/* Main Action */}
                <div className="border-t border-white/10 pt-4 mt-2">
                    {simState === 'idle' || simState === 'success' || simState === 'deadlocked' ? (
                        <button
                            onClick={simState === 'deadlocked' ? reset : runSimulation}
                            className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 ${simState === 'deadlocked' ? 'bg-white text-black hover:bg-gray-200' : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white'}`}
                        >
                            {simState === 'deadlocked' ? <RotateCcw size={16} /> : <Play size={16} />}
                            {simState === 'deadlocked' ? "Reset Simulation" : "Start Simulation"}
                        </button>
                    ) : (
                        <button className="w-full py-3 rounded-xl bg-white/5 text-white/50 font-bold text-sm cursor-wait border border-white/5">
                            Running...
                        </button>
                    )}
                </div>

                {/* Status Text */}
                <div className="text-center h-4">
                    <AnimatePresence mode="wait">
                        {simState === 'deadlocked' ? (
                            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-red-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                <AlertTriangle size={12} /> Deadlock Frozen
                            </motion.span>
                        ) : simState === 'success' ? (
                            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-green-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                <ShieldCheck size={12} /> All Competed
                            </motion.span>
                        ) : (
                            <span className="text-white/20 text-xs">
                                {mode === 'chaos' ? "Circular wait (A waits B, B waits A)." : "Ordered hierarchy prevents wait cycles."}
                            </span>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
};

export default DeadlockVis;
