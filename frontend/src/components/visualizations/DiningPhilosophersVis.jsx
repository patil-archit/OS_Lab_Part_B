import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Utensils, Coffee, AlertTriangle, ShieldCheck, ArrowRight, BookOpen } from 'lucide-react';

const DiningPhilosophersVis = () => {
    // -- Visual State --
    const [algo, setAlgo] = useState('naive'); // 'naive' | 'monitor'
    const [simState, setSimState] = useState('idle'); // 'idle', 'running', 'deadlocked'
    const [logs, setLogs] = useState([]);

    // VISUAL ONLY State (synced from Refs)
    const [visPhilosophers, setVisPhilosophers] = useState(Array(5).fill(0).map((_, i) => ({ id: i, status: 'thinking' }))); // status: thinking, hungry, eating, deadlocked
    const [visChopsticks, setVisChopsticks] = useState(Array(5).fill(null));

    // -- Logic State (Refs) --
    const chopsticksRef = useRef(Array(5).fill(null)); // null or ownerId
    const philRef = useRef(Array(5).fill(0).map((_, i) => ({ id: i, status: 'thinking', sem: 0 })));
    // In Monitor solution: status array is state[N], sem array is s[N], mutex is implicit in JS single thread but logic remains
    const isRunningRef = useRef(false);
    const timeouts = useRef([]);

    // -- Constants --
    const N = 5;
    const THINKING = 'thinking';
    const HUNGRY = 'hungry';
    const EATING = 'eating';
    const DEADLOCKED = 'deadlocked';

    useEffect(() => {
        return () => reset();
    }, [algo]); // Reset on algo change

    const addLog = (msg) => {
        setLogs(prev => [msg, ...prev].slice(0, 5));
    };

    const reset = () => {
        isRunningRef.current = false;
        setSimState('idle');
        setLogs([]);

        chopsticksRef.current = Array(5).fill(null);
        philRef.current = Array(5).fill(0).map((_, i) => ({ id: i, status: THINKING, sem: 0 }));

        timeouts.current.forEach(clearTimeout);
        timeouts.current = [];

        syncVisuals();
    };

    const syncVisuals = () => {
        setVisPhilosophers([...philRef.current]);
        setVisChopsticks([...chopsticksRef.current]);
    };

    const delay = (ms) => new Promise(r => {
        const id = setTimeout(r, ms);
        timeouts.current.push(id);
    });

    const startSimulation = () => {
        if (isRunningRef.current) return;
        reset();
        isRunningRef.current = true;
        setSimState('running');
        addLog(`Starting ${algo === 'naive' ? 'Naive' : 'Monitor'} Simulation...`);

        // Launch all threads
        for (let i = 0; i < N; i++) {
            philosopherThread(i);
        }
    };

    // -- Simulation Loops --

    const philosopherThread = async (i) => {
        // Initial thinking
        // addLog(`P${i} is thinking`);
        philRef.current[i].status = THINKING;
        syncVisuals();

        await delay(500 + Math.random() * 1000);

        while (isRunningRef.current) {

            if (algo === 'naive') {
                await takeForksNaive(i);
            } else {
                await takeForksMonitor(i);
            }

            if (!isRunningRef.current) break;

            // EATING behavior (common)
            // If we returned from takeForks, we are EATING
            // (Unless naive deadlock happened inside)

            if (philRef.current[i].status === EATING) {
                addLog(`P${i} is EATING`);
                await delay(2000); // Eat

                if (algo === 'naive') {
                    putForksNaive(i);
                } else {
                    putForksMonitor(i);
                }
                addLog(`P${i} finished eating, thinking.`);
            }

            // Think again
            philRef.current[i].status = THINKING;
            syncVisuals();
            await delay(1000 + Math.random() * 2000);
        }
    };


    // -- NAIVE ALGORITHM (Force Deadlock) --
    // Static Deadlock: Everyone becomes Hungry, then the system detects deadlock.
    // No forks are picked up visually.
    const takeForksNaive = async (i) => {
        philRef.current[i].status = HUNGRY;
        syncVisuals();

        // P0 triggers the deadlock after a delay
        if (i === 0) {
            await delay(1000);
            setSimState('deadlocked');
            addLog("Deadlock Detected: Circular Wait.");
            philRef.current.forEach(p => p.status = DEADLOCKED);
            syncVisuals();
            isRunningRef.current = false; // Stop simulation loop
        }

        // All threads match wait here until the simulation is officially stopped.
        // This prevents them from returning early and reverting to 'THINKING'.
        while (isRunningRef.current) {
            await delay(100);
        }
    };

    const putForksNaive = (i) => {
        // No-op if they never picked up
    };


    // -- MONITOR ALGORITHM (C Code Logic) --

    // Helpers for C logic
    const LEFT = (i) => (i + N - 1) % N;
    const RIGHT = (i) => (i + 1) % N;

    const test = (i) => {
        const p = philRef.current;
        // if (arr[phnum] == HUNGRY && arr[LEFT] != EATING && arr[RIGHT] != EATING)
        if (p[i].status === HUNGRY &&
            p[LEFT(i)].status !== EATING &&
            p[RIGHT(i)].status !== EATING) {

            p[i].status = EATING;
            addLog(`P${i} takes forks ${LEFT(i) + 1}, ${i + 1}`); // 1-based indexing for display

            // Visual Stick Acquisition:
            // P(i) needs Stick(Left) and Stick(Right).
            // Stick mapping: Stick k is between Phil k and Phil k+1.
            // P(i) is between Stick(i-1) and Stick(i).
            // So P(i) takes Stick(i-1) [Left] and Stick(i) [Right].

            const leftStickIdx = LEFT(i);
            const rightStickIdx = i;

            chopsticksRef.current[leftStickIdx] = i;
            chopsticksRef.current[rightStickIdx] = i;

            p[i].sem = 1; // Signal
            syncVisuals();
        }
    };

    const takeForksMonitor = async (i) => {
        // sem_wait(&mutex); -> atomic in JS
        philRef.current[i].status = HUNGRY;
        syncVisuals();

        test(i); // Try to eat

        // sem_post(&mutex);

        // sem_wait(&s[phnum]);
        // Block if not signaled (i.e. if status is not entering EATING)
        // In simulation, we check periodically.
        let waiting = true;
        while (waiting && isRunningRef.current) {
            if (philRef.current[i].status === EATING) {
                waiting = false;
            } else {
                await delay(100);
            }
        }
    };

    const putForksMonitor = (i) => {
        // sem_wait(&mutex);
        philRef.current[i].status = THINKING;

        // Release visual sticks
        const leftStickIdx = LEFT(i);
        const rightStickIdx = i;

        chopsticksRef.current[leftStickIdx] = null;
        chopsticksRef.current[rightStickIdx] = null;
        syncVisuals();

        test(LEFT(i));  // Check left neighbor
        test(RIGHT(i)); // Check right neighbor
        // sem_post(&mutex);
    };


    // -- Primitives --
    const acquireStick = async (philId, stickId) => {
        // Atomic grab if null
        if (chopsticksRef.current[stickId] === null) {
            chopsticksRef.current[stickId] = philId;
            syncVisuals();
            return true;
        }
        return false;
    };

    const releaseStick = (philId, stickId) => {
        if (chopsticksRef.current[stickId] === philId) {
            chopsticksRef.current[stickId] = null;
        }
    };

    // -- Render --
    const radius = 130;

    return (
        <div className="w-full bg-[#f5f5f4] rounded-3xl p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden font-manrope text-ink min-h-[500px] border border-black/5 shadow-2xl select-none">
            {/* Zen Pattern Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, #a8a29e 2px, transparent 2px)', backgroundSize: '30px 30px' }} />

            {/* Log Panel */}
            <div className="absolute top-6 right-6 z-20 w-64 pointer-events-none flex flex-col items-end gap-1">
                {logs.map((log, i) => (
                    <div key={i} className="text-[10px] bg-white/80 backdrop-blur border border-black/5 px-2 py-1 rounded shadow-sm opacity-80 text-right font-mono text-stone-600">
                        {log}
                    </div>
                ))}
            </div>

            {/* Header Controls (Abs Top Left) */}
            <div className="absolute top-6 left-6 z-20 flex bg-white p-1 rounded-xl border border-black/5 shadow-sm">
                <button onClick={() => { setAlgo('naive'); reset(); }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${algo === 'naive' ? 'bg-red-50 text-red-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}>
                    <AlertTriangle size={14} /> Naive (Deadlock)
                </button>
                <button onClick={() => { setAlgo('monitor'); reset(); }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${algo === 'monitor' ? 'bg-green-50 text-green-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}>
                    <ShieldCheck size={14} /> Monitor Solution
                </button>
            </div>

            {/* Main Table */}
            <div className="flex-1 flex items-center justify-center relative z-10 mt-10 md:mt-0">
                {/* Table Surface */}
                <div className="absolute w-[300px] h-[300px] rounded-full bg-stone-200 border-8 border-stone-300 shadow-inner flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border-2 border-stone-300/50 flex items-center justify-center text-center p-4">
                        <span className="text-xs font-serif italic text-stone-500">
                            {simState === 'deadlocked' ? "Deadlock!\nCircular Wait." : "Zen Garden\nof Concurrency"}
                        </span>
                    </div>
                </div>

                {/* Philosophers & Sticks */}
                {visPhilosophers.map((p, i) => {
                    const angle = (i * (360 / 5)) - 90;
                    const rad = (angle * Math.PI) / 180;
                    // Center
                    const cx = 0;
                    const cy = 0;

                    // Phil Coords
                    const px = cx + Math.cos(rad) * radius;
                    const py = cy + Math.sin(rad) * radius;

                    // Stick Slot Coords (Between i and i+1)
                    // Visual mapping: Stick i is between P(i) and P(i+1)
                    const stickAngle = angle + (360 / 5 / 2);
                    const stickRad = (stickAngle * Math.PI) / 180;
                    const sx = cx + Math.cos(stickRad) * (radius * 0.7);
                    const sy = cy + Math.sin(stickRad) * (radius * 0.7);

                    const stickId = i;
                    const stickOwner = visChopsticks[stickId];
                    const isTaken = stickOwner !== null;

                    // Calculate Moved Stick Position
                    let activeSx = sx;
                    let activeSy = sy;
                    let activeRot = stickAngle + 90;

                    if (isTaken) {
                        const ownerIndex = stickOwner;
                        const ownerAngle = (ownerIndex * (360 / 5)) - 90;
                        const ownerRad = (ownerAngle * Math.PI) / 180;

                        // Stick i is right of P(i) and left of P(i+1)
                        // If P(i) owns it -> Right Hand
                        if (stickId === ownerIndex) {
                            const offsetRad = ownerRad + 0.2; // Right side
                            activeSx = cx + Math.cos(offsetRad) * (radius * 0.85);
                            activeSy = cy + Math.sin(offsetRad) * (radius * 0.85);
                            activeRot = ownerAngle + 135;
                        } else {
                            // P((i+1)%5) owns it? -> Left Hand
                            // Actually wait, if stickId is i. 
                            // If owner is (i+1)%5. 
                            // P(owner) is taking stick (owner-1).
                            // Yes.
                            const offsetRad = (ownerIndex * (360 / 5) - 90) * Math.PI / 180 - 0.2; // Left side
                            activeSx = cx + Math.cos(offsetRad) * (radius * 0.85);
                            activeSy = cy + Math.sin(offsetRad) * (radius * 0.85);
                            activeRot = (ownerIndex * (360 / 5) - 90) + 45;
                        }
                    }

                    return (
                        <React.Fragment key={i}>
                            {/* Chopstick */}
                            <motion.div
                                animate={{
                                    x: activeSx,
                                    y: activeSy,
                                    rotate: activeRot,
                                    scale: isTaken ? 1.2 : 1,
                                    backgroundColor: isTaken ? '#44403c' : '#d6d3d1'
                                }}
                                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                className="absolute w-1.5 h-16 rounded-full origin-bottom z-30 shadow-sm"
                                style={{
                                    left: '50%', top: '50%', // Centered reference
                                    marginLeft: -3, marginTop: -32 // Pivot fix
                                }}
                            />

                            {/* Philosopher Plate */}
                            <motion.div
                                animate={{
                                    scale: p.status === EATING ? 1.1 : 1,
                                    backgroundColor: p.status === EATING ? '#22c55e' : p.status === DEADLOCKED ? '#ef4444' : p.status === HUNGRY ? '#facc15' : '#ffffff',
                                    borderColor: p.status === EATING ? '#16a34a' : p.status === DEADLOCKED ? '#dc2626' : '#e5e5e5'
                                }}
                                className="absolute w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center shadow-xl z-20 overflow-hidden bg-white"
                                style={{
                                    left: '50%', top: '50%',
                                    x: px - 40, y: py - 40 // Centered
                                }}
                            >
                                {p.status === EATING ? <Utensils size={24} className="text-white" /> :
                                    p.status === DEADLOCKED ? <AlertTriangle size={24} className="text-white" /> :
                                        p.status === HUNGRY ? <Utensils size={24} className="text-stone-800 opacity-50" /> :
                                            <Coffee size={24} className="text-stone-400" />
                                }
                                <div className="text-[10px] font-bold uppercase mt-1 opacity-70">
                                    P{p.id}
                                </div>
                            </motion.div>
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Play Button */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
                <button onClick={simState === 'running' || simState === 'deadlocked' ? reset : startSimulation}
                    className={`px-8 py-3 rounded-full font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2 ${simState === 'running' ? 'bg-white border border-black/5 text-ink' : 'bg-stone-800 text-white hover:bg-black'}`}>
                    {simState === 'running' || simState === 'deadlocked' ? <RotateCcw size={18} /> : <Play size={18} />}
                    {simState === 'running' ? "Reset Simulation" : simState === 'deadlocked' ? "Reset Deadlock" : "Start Dinner"}
                </button>
            </div>

        </div>
    );
};

export default DiningPhilosophersVis;
