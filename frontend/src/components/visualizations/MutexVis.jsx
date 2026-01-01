import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, User } from 'lucide-react';

const MutexVis = () => {
    const [lockedBy, setLockedBy] = useState(null);
    const [queue, setQueue] = useState([]);
    const [threads] = useState([1, 2, 3, 4]);

    const requestLock = (id) => {
        if (lockedBy === id) return;
        if (lockedBy === null) {
            setLockedBy(id);
        } else {
            if (!queue.includes(id)) setQueue([...queue, id]);
        }
    };

    const releaseLock = () => {
        setLockedBy(null);
        if (queue.length > 0) {
            const [next, ...rest] = queue;
            setLockedBy(next);
            setQueue(rest);
        }
    };

    return (
        <div className="w-full bg-black/5 rounded-3xl p-8 flex flex-col items-center gap-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-black/[0.05] pointer-events-none" />

            {/* Central Resource (The Lock) */}
            <motion.div
                animate={{
                    scale: lockedBy ? 1.1 : 1,
                    boxShadow: lockedBy
                        ? "0 0 50px -10px rgba(16, 185, 129, 0.5)"
                        : "0 0 0px 0px rgba(0,0,0,0)"
                }}
                className={`w-32 h-32 rounded-full flex items-center justify-center z-10 transition-colors duration-500 ${lockedBy ? 'bg-green-500 text-white' : 'bg-white border-4 border-dashed border-ink/20 text-ink/20'}`}
            >
                <AnimatePresence mode="popLayout">
                    {lockedBy ? (
                        <motion.div
                            key="locked"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            className="flex flex-col items-center"
                        >
                            <Lock size={32} />
                            <span className="font-bold font-mono mt-1">Has Key: {lockedBy}</span>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="unlocked"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                        >
                            <Unlock size={32} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Threads / Controls */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm z-10">
                {threads.map(id => {
                    const isOwner = lockedBy === id;
                    const isWaiting = queue.includes(id);

                    return (
                        <motion.button
                            key={id}
                            layout
                            onClick={() => isOwner ? releaseLock() : requestLock(id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`
                relative p-4 rounded-xl flex items-center gap-3 font-bold text-sm shadow-sm border transition-all
                ${isOwner ? 'bg-green-500 text-white border-green-600 ring-4 ring-green-500/20' : ''}
                ${isWaiting ? 'bg-orange-100 text-orange-800 border-orange-200' : ''}
                ${!isOwner && !isWaiting ? 'bg-white text-ink border-black/10 hover:border-black/30' : ''}
              `}
                        >
                            <User size={18} />
                            <span>Thread {id}</span>

                            {isOwner && <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded">Release</span>}
                            {isWaiting && <span className="ml-auto text-xs animate-pulse">Waiting...</span>}
                            {!isOwner && !isWaiting && <span className="ml-auto text-xs opacity-50">Request</span>}

                            {/* Connection Line Animation (Simplified visual) */}
                            {isOwner && (
                                <motion.div
                                    layoutId="connection-line"
                                    className="absolute -top-4 left-1/2 w-1 h-8 bg-green-500 -z-10"
                                    initial={{ height: 0 }}
                                    animate={{ height: "40px" }}
                                />
                            )}
                        </motion.button>
                    )
                })}
            </div>

            <div className="text-xs text-ink/40 font-mono text-center max-w-xs">
                Click a thread to request the lock. If locked, it joins the queue. Owner must release it.
            </div>
        </div>
    );
};

export default MutexVis;
