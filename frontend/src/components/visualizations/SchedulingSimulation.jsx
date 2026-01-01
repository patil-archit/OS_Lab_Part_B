import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Plus, Trash2, Cpu, Brain, Clock, BarChart2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const SchedulingSimulation = ({ algorithmId }) => {
    // -- State --
    const [processes, setProcesses] = useState([
        { pid: 1, arrivalTime: 0, burstTime: 5, priority: 1 },
        { pid: 2, arrivalTime: 1, burstTime: 3, priority: 2 },
        { pid: 3, arrivalTime: 2, burstTime: 8, priority: 3 },
    ]);
    // Use the passed algorithmId, default to fcfs if missing
    const algorithm = algorithmId || 'fcfs';

    const [quantum, setQuantum] = useState(2);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null); // { schedule, metrics, aiAnalysis }

    // -- Handlers --
    const addProcess = () => {
        const nextPid = processes.length > 0 ? Math.max(...processes.map(p => p.pid)) + 1 : 1;
        setProcesses([...processes, { pid: nextPid, arrivalTime: 0, burstTime: 5, priority: 1 }]);
    };

    const removeProcess = (idx) => {
        const newProc = [...processes];
        newProc.splice(idx, 1);
        setProcesses(newProc);
    };

    const updateProcess = (idx, field, val) => {
        const newProc = [...processes];
        let newValue = Number(val);

        if (field === 'burstTime') {
            if (newValue < 1) newValue = 1;
        } else {
            if (newValue < 0) newValue = 0;
        }

        newProc[idx][field] = newValue;
        setProcesses(newProc);
    };

    const runSimulation = async () => {
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch('http://localhost:8000/api/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ algorithm, quantum, processes })
            });
            const data = await res.json();
            setResult(data);
        } catch (err) {
            console.error(err);
            alert("Simulation Failed: Check Backend Connection");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Controls */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-[#FAFAFA] rounded-3xl p-6 border border-black/5 space-y-6 text-sm">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Cpu size={18} className="text-blue-600" /> Configuration
                        </h2>

                        {/* Only show Quantum if Round Robin */}
                        {algorithm === 'round_robin' && (
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-black/40 mb-2">Time Quantum</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantum}
                                    onChange={e => setQuantum(Math.max(1, Number(e.target.value)))}
                                    className="w-full bg-white p-3 rounded-xl font-medium outline-none focus:border-blue-500 border border-black/5 transition-colors"
                                />
                            </div>
                        )}

                        {/* Process List */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-black/60">Processes</span>
                                <button onClick={addProcess} className="p-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                                    <Plus size={16} />
                                </button>
                            </div>

                            {processes.map((p, idx) => (
                                <div key={idx} className="bg-white p-3 rounded-xl border border-black/5 grid grid-cols-4 gap-2 items-center relative group">
                                    <div className="col-span-4 flex justify-between mb-1">
                                        <span className="text-[10px] font-bold text-black/40 uppercase">P{p.pid}</span>
                                        {processes.length > 1 && (
                                            <button onClick={() => removeProcess(idx)} className="text-red-400 hover:text-red-600">
                                                <Trash2 size={12} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="text-[8px] uppercase font-bold text-black/30">Arr</label>
                                        <input type="number" min="0" value={p.arrivalTime} onChange={e => updateProcess(idx, 'arrivalTime', e.target.value)} className="bg-gray-50 border rounded p-1 text-xs w-full" />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[8px] uppercase font-bold text-black/30">Burst</label>
                                        <input type="number" min="1" value={p.burstTime} onChange={e => updateProcess(idx, 'burstTime', e.target.value)} className="bg-gray-50 border rounded p-1 text-xs w-full" />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[8px] uppercase font-bold text-black/30">Prio</label>
                                        <input type="number" min="0" value={p.priority} onChange={e => updateProcess(idx, 'priority', e.target.value)} className="bg-gray-50 border rounded p-1 text-xs w-full" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={runSimulation}
                            disabled={loading}
                            className="w-full py-3 bg-black text-white rounded-xl font-bold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Clock size={16} className="animate-spin" /> : <Play size={16} fill="white" />}
                            {loading ? "Running..." : "Simulate"}
                        </button>
                    </div>
                </div>

                {/* Right: Visualization */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Gantt Chart Area */}
                    {result ? (
                        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                            {/* Viz Card */}
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5">
                                <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
                                    <BarChart2 size={16} className="text-purple-600" /> Gantt Chart
                                </h2>

                                <div className="relative h-20 bg-[#f8f9fa] rounded-xl overflow-hidden flex items-center px-2 border border-black/5">
                                    {result.schedule.map((block, i) => {
                                        const totalDuration = result.schedule[result.schedule.length - 1].end;
                                        const width = (block.duration / totalDuration) * 100;
                                        return (
                                            <motion.div
                                                key={i}
                                                initial={{ width: 0, opacity: 0 }}
                                                animate={{ width: `${width}%`, opacity: 1 }}
                                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                                className="h-12 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm border-r border-white/20 relative group cursor-help"
                                                style={{
                                                    backgroundColor: `hsl(${block.pid * 50}, 70%, 50%)`
                                                }}
                                            >
                                                P{block.pid}
                                                <div className="absolute bottom-full mb-2 bg-black/90 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                                                    Start: {block.start} | End: {block.end}
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                                <div className="mt-2 flex justify-between text-[10px] font-mono text-black/40">
                                    <span>0</span>
                                    <span>{result.schedule[result.schedule.length - 1]?.end} Units</span>
                                </div>
                            </div>

                            {/* Metrics & AI Analysis Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {/* Metrics */}
                                <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5">
                                    <h3 className="text-sm font-bold mb-3">Metrics</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                                            <span className="text-xs font-medium text-blue-900">Avg Wait</span>
                                            <span className="text-sm font-bold text-blue-600">{result.metrics.averageWaiting.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
                                            <span className="text-xs font-medium text-purple-900">Avg Turnaround</span>
                                            <span className="text-sm font-bold text-purple-600">{result.metrics.averageTurnaround.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* AI Analysis */}
                                <div className="bg-[#111] text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-2 opacity-10">
                                        <Brain size={48} />
                                    </div>
                                    <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
                                        <Brain size={14} className="text-pink-500" /> AI Risk Check
                                    </h3>
                                    <div className="prose prose-invert prose-xs max-w-none text-white/80 leading-relaxed">
                                        <ReactMarkdown>{result.aiAnalysis}</ReactMarkdown>
                                    </div>
                                </div>

                            </div>
                        </div>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-black/20 border-2 border-dashed border-black/10 rounded-3xl">
                            <BarChart2 size={32} className="mb-4" />
                            <p className="font-medium text-sm">Run simulation to see results</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SchedulingSimulation;
