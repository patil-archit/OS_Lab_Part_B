import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Box, Truck, PauseCircle, Zap, Package, AlertCircle } from 'lucide-react';

const ProducerConsumerVis = () => {
    // -- VIsual State --
    const [bufferSize, setBufferSize] = useState(5);
    // We mirror refs to state for rendering
    const [visBuffer, setVisBuffer] = useState([]);
    const [visInPtr, setVisInPtr] = useState(0);
    const [visOutPtr, setVisOutPtr] = useState(0);
    const [prodState, setProdState] = useState('idle');
    const [consState, setConsState] = useState('idle');
    const [prodSpeed, setProdSpeed] = useState(1);
    const [consSpeed, setConsSpeed] = useState(1);
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState([]); // Array of strings

    // -- Logic State --
    const bufferRef = useRef([]);
    const countRef = useRef(0); // Using single count index (LIFO Stack pointer)
    const nextId = useRef(1);

    const loopRefs = useRef({ prod: null, cons: null });
    const isRunningRef = useRef(false);

    // -- Lifecycle --
    useEffect(() => {
        reset();
        return () => stopSimulation();
    }, []);

    useEffect(() => {
        reset();
    }, [bufferSize]);

    const addLog = (msg, type = 'info') => {
        setLogs(prev => {
            const newLog = { id: Date.now() + Math.random(), msg, type };
            return [newLog, ...prev].slice(0, 10); // Keep last 10
        });
    };

    const stopSimulation = () => {
        isRunningRef.current = false;
        setIsRunning(false);
        clearTimeout(loopRefs.current.prod);
        clearTimeout(loopRefs.current.cons);
    };

    const reset = () => {
        stopSimulation();
        bufferRef.current = Array(bufferSize).fill(null);
        countRef.current = 0;
        nextId.current = 1;

        syncVisuals();
        setProdState('idle');
        setConsState('idle');
        setLogs([]);
        addLog("System Reset", 'info');
    };

    const syncVisuals = () => {
        setVisBuffer([...bufferRef.current]);
    };

    const startSimulation = () => {
        if (isRunningRef.current) return;
        isRunningRef.current = true;
        setIsRunning(true);
        addLog("Simulation Started", 'success');

        produceLoop();
        consumeLoop();
    };

    const delay = (ms) => new Promise(r => setTimeout(r, ms));

    // -- PRODUCER (LIFO / Stack Behavior) --
    // Code: arr[count++] = item
    const produceLoop = async () => {
        if (!isRunningRef.current) return;

        // 1. Wait for Empty Slot (sem_wait(&empty))
        // If count == SIZE, buffer is full.
        if (countRef.current >= bufferSize) {
            if (prodState !== 'sleeping') {
                setProdState('sleeping');
                addLog("Buffer FULL! Producer Sleeps.", 'warning');
            }
            loopRefs.current.prod = setTimeout(produceLoop, 500);
            return;
        }

        // 2. Produce Item
        setProdState('working');
        await delay(1000 / prodSpeed);
        if (!isRunningRef.current) return;

        // 3. Critical Section (Mutex Lock)
        // Double check full condition after delay
        if (countRef.current >= bufferSize) {
            setProdState('sleeping');
            loopRefs.current.prod = setTimeout(produceLoop, 100);
            return;
        }

        const item = { id: nextId.current++, color: getRandomColor() };

        // arr[count++] = item;
        const idx = countRef.current;
        bufferRef.current[idx] = item;
        countRef.current++;

        syncVisuals();
        setProdState('idle');
        addLog(`Produced Item #${item.id} at [${idx}]`, 'success');

        // Loop
        loopRefs.current.prod = setTimeout(produceLoop, 1000 / prodSpeed);
    };

    // -- CONSUMER (LIFO / Stack Behavior) --
    // Code: item = arr[--count]
    const consumeLoop = async () => {
        if (!isRunningRef.current) return;

        // 1. Wait for Full Slot (sem_wait(&full))
        // If count == 0, buffer is empty.
        if (countRef.current <= 0) {
            if (consState !== 'sleeping') {
                setConsState('sleeping');
                addLog("Buffer EMPTY! Consumer Sleeps.", 'error');
            }
            loopRefs.current.cons = setTimeout(consumeLoop, 500);
            return;
        }

        // 2. Wait/Prepare
        await delay(500 / consSpeed);
        if (!isRunningRef.current) return;

        // 3. Critical Section
        if (countRef.current <= 0) {
            setConsState('sleeping');
            loopRefs.current.cons = setTimeout(consumeLoop, 100);
            return;
        }

        // item = arr[--count];
        countRef.current--;
        const idx = countRef.current;
        const item = bufferRef.current[idx];
        bufferRef.current[idx] = null;

        syncVisuals();

        // 4. Consume Item
        setConsState('working');
        await delay(1000 / consSpeed);
        if (!isRunningRef.current) return;

        addLog(`Consumed Item #${item.id} from [${idx}]`, 'info');
        setConsState('idle');

        // Loop
        loopRefs.current.cons = setTimeout(consumeLoop, 1000 / consSpeed);
    };

    const getRandomColor = () => {
        const colors = ['#f472b6', '#a78bfa', '#34d399', '#facc15', '#60a5fa'];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    // -- Render --
    const radius = 100;
    const center = { x: 150, y: 150 };

    return (
        <div className="w-full bg-[#111] rounded-3xl p-6 flex flex-col lg:flex-row gap-6 relative overflow-hidden font-manrope text-white h-[500px] border border-white/5 shadow-2xl select-none">
            {/* Factory Floor Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'repeating-linear-gradient(45deg, #222 0px, #222 10px, #333 10px, #333 20px)' }} />

            {/* Left Side: Visuals */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center z-20 mb-10">
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className="text-xs font-bold uppercase tracking-widest text-white/50">{isRunning ? "System Active" : "System Halted"}</span>
                    </div>

                    {/* Buffer Size Control */}
                    <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1 border border-white/10">
                        <span className="text-[10px] font-bold uppercase px-2 text-white/40">Buffer Size</span>
                        {/* ENABLED even if running, will trigger reset via useEffect */}
                        <button disabled={bufferSize <= 3} onClick={() => setBufferSize(b => b - 1)} className="w-6 h-6 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded disabled:opacity-20">-</button>
                        <span className="w-4 text-center font-mono text-sm">{bufferSize}</span>
                        <button disabled={bufferSize >= 10} onClick={() => setBufferSize(b => b + 1)} className="w-6 h-6 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded disabled:opacity-20">+</button>
                    </div>
                </div>

                {/* Visualization Area */}
                <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8 z-10 relative">

                    {/* Producer Station */}
                    <div className="flex flex-col items-center gap-4 w-32">
                        <div className={`relative w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-300 ${prodState === 'working' ? 'border-green-500 bg-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : prodState === 'sleeping' ? 'border-yellow-500 bg-yellow-500/10' : 'border-white/10 bg-white/5'}`}>
                            <Box size={32} className={prodState === 'working' ? 'text-green-500 animate-bounce' : prodState === 'sleeping' ? 'text-yellow-500' : 'text-white/20'} />
                            <div className="absolute -top-3 bg-[#111] px-2 text-[10px] font-bold uppercase tracking-widest text-white/50 border border-white/10 rounded-full">Producer</div>

                            {prodState === 'sleeping' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -bottom-6 text-yellow-500 text-xs font-bold flex items-center gap-1">
                                    <PauseCircle size={10} /> Sleeping
                                </motion.div>
                            )}
                        </div>
                        <input type="range" min="0.5" max="3" step="0.5" value={prodSpeed} onChange={e => setProdSpeed(Number(e.target.value))} className="w-full accent-green-500 h-1 bg-white/10 rounded-lg appearance-none" />
                    </div>


                    {/* Circular Buffer */}
                    <div className="relative w-[300px] h-[300px] flex-shrink-0">
                        {/* Connection Lines */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                            <path d="M 0 150 L 50 150" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
                            <path d="M 250 150 L 300 150" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
                        </svg>

                        {Array(bufferSize).fill(0).map((_, i) => {
                            const angle = (i * (360 / bufferSize)) - 90;
                            const rad = (angle * Math.PI) / 180;
                            const x = center.x + Math.cos(rad) * radius;
                            const y = center.y + Math.sin(rad) * radius;

                            const item = visBuffer[i];
                            // Stack visualization: 
                            // Filled items are 0 to count-1.
                            // Next empty is count.
                            const isFilled = item !== null;
                            const isNext = !isFilled && (i === 0 || visBuffer[i - 1] !== null);
                            // Actually simplified: plain buffer view is enough.

                            return (
                                <React.Fragment key={i}>
                                    {/* Slot */}
                                    <div
                                        className={`absolute w-14 h-14 rounded-full border-2 -ml-7 -mt-7 flex items-center justify-center transition-colors duration-300 ${isFilled ? 'border-purple-500/50 bg-purple-500/10' : 'border-white/10 bg-white/5'}`}
                                        style={{ left: x, top: y }}
                                    >
                                        <span className="text-[8px] text-white/10 font-bold">{i}</span>
                                    </div>

                                    {/* Item */}
                                    <AnimatePresence>
                                        {item && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0 }}
                                                className="absolute w-8 h-8 rounded-full shadow-lg flex items-center justify-center -ml-4 -mt-4 z-10"
                                                style={{ left: x, top: y, backgroundColor: item.color, boxShadow: `0 0 15px ${item.color}80` }}
                                            >
                                                <Package size={14} className="text-black/50" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </React.Fragment>
                            );
                        })}

                        <div className="absolute inset-0 m-auto w-24 h-24 rounded-full border border-white/5 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-white">{visBuffer.filter(x => x).length} / {bufferSize}</span>
                            <span className="text-[8px] uppercase tracking-widest text-white/40">BUFFER</span>
                        </div>
                    </div>


                    {/* Consumer Station */}
                    <div className="flex flex-col items-center gap-4 w-32">
                        <div className={`relative w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-300 ${consState === 'working' ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : consState === 'sleeping' ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 bg-white/5'}`}>
                            <Truck size={32} className={consState === 'working' ? 'text-blue-500 animate-pulse' : consState === 'sleeping' ? 'text-yellow-500' : 'text-white/20'} />
                            <div className="absolute -top-3 bg-[#111] px-2 text-[10px] font-bold uppercase tracking-widest text-white/50 border border-white/10 rounded-full">Consumer</div>

                            {consState === 'sleeping' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -bottom-6 text-orange-500 text-xs font-bold flex items-center gap-1 whitespace-nowrap">
                                    <PauseCircle size={10} /> Sleeping
                                </motion.div>
                            )}
                        </div>
                        <input type="range" min="0.5" max="3" step="0.5" value={consSpeed} onChange={e => setConsSpeed(Number(e.target.value))} className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none" />
                    </div>


                    {/* Play Button Overlay - Moved inside Vis Area to not block Header */}
                    {!isRunning && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] rounded-2xl">
                            <button onClick={startSimulation} className="bg-white text-black px-8 py-3 rounded-full font-bold shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-110 transition-transform flex items-center gap-2">
                                <Play size={20} fill="black" /> Start Simulation
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side: Logs */}
            <div className="w-full lg:w-64 bg-black/40 border-l border-white/5 p-4 flex flex-col gap-4 overflow-hidden rounded-r-3xl">
                <div className="text-xs font-bold uppercase tracking-widest text-white/30 flex items-center gap-2">
                    <Zap size={14} className="text-yellow-500" /> Live Logic Log
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 mask-linear">
                    <AnimatePresence initial={false}>
                        {logs.map(log => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                className={`text-[10px] font-mono p-2 rounded border-l-2 ${log.type === 'error' ? 'border-red-500 bg-red-500/10 text-red-200' :
                                    log.type === 'warning' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-200' :
                                        log.type === 'success' ? 'border-green-500 bg-green-500/10 text-green-200' :
                                            'border-white/20 bg-white/5 text-white/60'
                                    }`}
                            >
                                {log.msg}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {logs.length === 0 && <span className="text-white/10 text-xs italic">Waiting for events...</span>}
                </div>

                <button onClick={reset} className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white/50 transition-colors flex items-center justify-center gap-2">
                    <RotateCcw size={12} /> Reset Log
                </button>
            </div>

        </div>
    );
};

export default ProducerConsumerVis;
