"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function RRScheduler() {
    // Form state
    const [rows, setRows] = useState([
        { id: "P1", arrival: 0, burst: 5 },
        { id: "P2", arrival: 2, burst: 3 },
        { id: "P3", arrival: 4, burst: 4 },
    ]);
    const [error, setError] = useState("");

    // Simulation state
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [time, setTime] = useState(0);
    const [readyQueue, setReadyQueue] = useState([]); // queue of process objects
    const [running, setRunning] = useState(null); // { id, arrival, burst, remaining, startTime? }
    const [segments, setSegments] = useState([]); // Gantt segments: { id, start, end }
    const [log, setLog] = useState([]);
    const [showSim, setShowSim] = useState(false);
    const [speed, setSpeed] = useState(1); // 0.5x..4x
    const [quantum,setQuantum] = useState(2);

    // Internal refs to avoid stale closures in interval
    const timeRef = useRef(0);
    const runningRef = useRef(null);
    const queueRef = useRef([]);
    const arrivalsRef = useRef([]);
    const segmentsRef = useRef([]);
    const pausedRef = useRef(false);
    const runningId = useRef(null); // used to track current segment
    const idleRef = useRef(false);
    const tailRequeueRef = useRef([]); // hold processes to append after next tick's arrivals

    // Precompute arrivals from form
    const initialArrivals = useMemo(() => {
        const cleaned = rows
            .map((r) => ({
                id:
                    String(r.id || "").trim() ||
                    "P" + Math.random().toString(16).slice(2, 6),
                arrival: +r.arrival,
                burst: +r.burst,
            }))
            .filter(
                (r) =>
                    Number.isFinite(r.arrival) &&
                    Number.isFinite(r.burst) &&
                    r.burst > 0 &&
                    r.arrival >= 0
            );
        cleaned.sort((a, b) => a.arrival - b.arrival);
        return cleaned;
    }, [rows]);

    // Metrics
    const metrics = useMemo(() => {
        if (segments.length === 0) return null;
        // Build completion map
        const completion = new Map();
        for (const s of segments) completion.set(s.id, s.end);

        const burstMap = new Map();
        const arrivalMap = new Map();
        for (const p of initialArrivals) {
            burstMap.set(p.id, p.burst);
            arrivalMap.set(p.id, p.arrival);
        }

        const rowsCalc = [];
        let totalWT = 0;
        let totalTAT = 0;

        for (const p of initialArrivals) {
            const ct = completion.get(p.id) ?? 0;
            const tat = ct - p.arrival;
            const wt = tat - p.burst;
            rowsCalc.push({
                id: p.id,
                arrival: p.arrival,
                burst: p.burst,
                completion: ct,
                tat,
                wt,
            });
            totalWT += wt;
            totalTAT += tat;
        }

        const avgWT = rowsCalc.length ? +(totalWT / rowsCalc.length).toFixed(2) : 0;
        const avgTAT = rowsCalc.length
            ? +(totalTAT / rowsCalc.length).toFixed(2)
            : 0;

        return { rowsCalc, avgWT, avgTAT };
    }, [segments, initialArrivals]);

    // Total time for Gantt scaling
    const totalTime = useMemo(
        () => (segments.length ? Math.max(...segments.map((s) => s.end)) : 0),
        [segments]
    );

    /** Validation */
    function validate() {
        if (rows.length === 0) return "Please add at least one process.";
        for (const r of rows) {
            if (r.id === "" || r.id == null) return "Each process needs an ID.";
            if (!Number.isFinite(+r.arrival) || +r.arrival < 0)
                return "Arrival times must be non-negative numbers.";
            if (!Number.isFinite(+r.burst) || +r.burst <= 0)
                return "Burst times must be positive numbers.";
        }
        return "";
    }

    /** Start Simulation */
    function handleStart() {
        const e = validate();
        if (e) {
            setError(e);
            return;
        }
        setError("");

        // Reset state
        setTime(0);
        setReadyQueue([]);
        setRunning(null);
        setSegments([]);
        setLog([]);
        setIsRunning(true);
        setIsPaused(false);
        setShowSim(true);

        // Initialize refs
        timeRef.current = 0;
        runningRef.current = null;
        queueRef.current = [];
        arrivalsRef.current = initialArrivals.map((p) => ({ ...p })); // copy
        segmentsRef.current = [];
        pausedRef.current = false;
        runningId.current = null;
        idleRef.current = false;
        tailRequeueRef.current = [];

        // Kick off first tick immediately so UI shows something
        tick();
    }

    /** Pause / Resume */
    function handlePauseResume() {
        if (!isRunning) return;
        setIsPaused((p) => {
            pausedRef.current = !p;
            return !p;
        });
    }

    /** Reset */
    function handleReset() {
        setIsRunning(false);
        setIsPaused(false);
        setShowSim(false);
        setTime(0);
        setReadyQueue([]);
        setRunning(null);
        setSegments([]);
        setLog([]);
        // clear any deferred requeues
        if (tailRequeueRef) tailRequeueRef.current = [];
    }

    // Interval runner
    useEffect(() => {
        if (!isRunning) return;
        const baseMs = 1000;
        const interval = setInterval(() => {
            if (!pausedRef.current) tick();
        }, Math.max(50, baseMs / speed));
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRunning, speed]);

    /** One simulation tick (1 time unit) */
    function tick() {
        const t = timeRef.current;

        // 1) Move newly arrived processes into ready queue
        const newArrivals = [];
        for (let i = 0; i < arrivalsRef.current.length; i++) {
            const p = arrivalsRef.current[i];
            if (p.arrival === t) newArrivals.push(p);
        }
        if (newArrivals.length) {
            // Ensure arrivals have remaining initialized
            const withRemaining = newArrivals.map((p) => ({ ...p, remaining: p.burst }));
            queueRef.current = [...queueRef.current, ...withRemaining];
            setReadyQueue([...queueRef.current]);
            setLog((l) => [
                ...l,
                `t=${t}: arrived → ${newArrivals.map((x) => x.id).join(", ")}`,
            ]);
        }

        // After processing arrivals for this tick, append any deferred requeues
        if (tailRequeueRef.current.length > 0) {
            queueRef.current = [...queueRef.current, ...tailRequeueRef.current];
            tailRequeueRef.current = [];
            setReadyQueue([...queueRef.current]);
        }

        // 2) If CPU idle, dispatch next from ready queue (RR)
        if (!runningRef.current) {
            const next = queueRef.current.shift() || null;
            if (next) {
                const remaining = next.remaining != null ? next.remaining : next.burst;
                const quantumLeft = Math.min(quantum, remaining);
                runningRef.current = { ...next, remaining, quantumLeft, startTime: t };
                runningId.current = next.id;
                setRunning({ ...runningRef.current });
                setReadyQueue([...queueRef.current]);
                setLog((l) => [...l, `t=${t}: ${next.id} dispatched to CPU (RR)`]);
            } else {
                // CPU idle this tick
                idleRef.current = true;
            }
        }

        // 3) Execute one unit
        if (runningRef.current) {
            runningRef.current.remaining -= 1;
            if (typeof runningRef.current.quantumLeft !== "number") {
                runningRef.current.quantumLeft = Math.min(quantum, runningRef.current.remaining + 1);
            }
            runningRef.current.quantumLeft -= 1;
            setRunning({ ...runningRef.current });

            // If just started, open a segment
            if (
                segmentsRef.current.length === 0 ||
                segmentsRef.current[segmentsRef.current.length - 1].id !==
                runningId.current ||
                segmentsRef.current[segmentsRef.current.length - 1].end !== t
            ) {
                // Start or extend segment from t to t+1; we'll keep extending below
                segmentsRef.current.push({
                    id: runningId.current,
                    start: t,
                    end: t + 1,
                });
            } else {
                // Extend the last segment's end
                segmentsRef.current[segmentsRef.current.length - 1].end = t + 1;
            }

            // Finished?
            if (runningRef.current.remaining === 0) {
                const finishedProcess = runningRef.current; // keep a reference
                setLog((l) => [...l, `t=${t + 1}: ${finishedProcess.id} completed`]);
                runningRef.current = null;
                setRunning(null);
            } else if (runningRef.current.quantumLeft === 0) {
                // Time slice over, requeue the process
                const sliceOver = runningRef.current;
                // Defer requeue so that next tick's arrivals are added before this one
                tailRequeueRef.current.push({ ...sliceOver });
                setLog((l) => [...l, `t=${t + 1}: ${sliceOver.id} time slice over → requeued (deferred)`]);
                runningRef.current = null;
                setRunning(null);
            }
        }

        // 4) Advance time
        timeRef.current = t + 1;
        setTime(timeRef.current);

        // 5) Commit segments to state
        setSegments([...segmentsRef.current]);

        // 6) End condition: no more arrivals, no running, queue empty
        const allArrived =
            timeRef.current > Math.max(0, ...initialArrivals.map((p) => p.arrival));
        if (allArrived && !runningRef.current && queueRef.current.length === 0) {
            setIsRunning(false);
            setIsPaused(false);
            pausedRef.current = true;
        }
    }

    /** UI: helpers */
    function updateRow(i, key, value) {
        setRows((prev) => {
            const copy = [...prev];
            copy[i] = { ...copy[i], [key]: value };
            return copy;
        });
    }
    function addRow() {
        const nextIdx = rows.length + 1;
        setRows((r) => [...r, { id: `P${nextIdx}`, arrival: 0, burst: 1 }]);
    }
    function removeRow(i) {
        setRows((r) => r.filter((_, idx) => idx !== i));
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold">
                Round Robin (RR) Scheduling Simulator
            </h1>
            <p className="text-sm text-gray-600 mt-1">
                Enter processes, then simulate RR with a live animation.
            </p>

            {/* Form */}
            <div className="mt-6 bg-white/70 rounded-2xl shadow p-4">
                {error && <div className="mb-3 text-red-600 text-sm">{error}</div>}
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left border-b">
                                <th className="py-2 pr-4">Process ID</th>
                                <th className="py-2 pr-4">Arrival Time</th>
                                <th className="py-2 pr-4">Burst Time</th>
                                <th className="py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r, idx) => (
                                <tr key={idx} className="border-b last:border-b-0">
                                    <td className="py-2 pr-4">
                                        <input
                                            className="border rounded px-2 py-1 w-28"
                                            value={r.id}
                                            onChange={(e) => updateRow(idx, "id", e.target.value)}
                                        />
                                    </td>
                                    <td className="py-2 pr-4">
                                        <input
                                            type="number"
                                            className="border rounded px-2 py-1 w-28"
                                            value={r.arrival}
                                            onChange={(e) =>
                                                updateRow(idx, "arrival", +e.target.value)
                                            }
                                        />
                                    </td>
                                    <td className="py-2 pr-4">
                                        <input
                                            type="number"
                                            className="border rounded px-2 py-1 w-28"
                                            value={r.burst}
                                            onChange={(e) => updateRow(idx, "burst", +e.target.value)}
                                        />
                                    </td>
                                    <td className="py-2">
                                        <button
                                            className="text-xs px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                                            onClick={() => removeRow(idx)}
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-3 flex gap-2">
                    <button
                        onClick={addRow}
                        className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                    >
                        + Add Process
                    </button>
                    <div className="flex items-center gap-2">
                        <label htmlFor="quantum" className="text-sm bg-blue-600 text-white px-2 py-2 rounded-lg">Time Quantum</label>
                        <input type="number" value={quantum} className="border rounded px-2 py-1 w-28" onChange={(e) => setQuantum(+e.target.value)} />
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                        <label className="text-sm">Speed: {speed.toFixed(1)}x</label>
                        <input
                            type="range"
                            min={0.5}
                            max={4}
                            step={0.5}
                            value={speed}
                            onChange={(e) => setSpeed(+e.target.value)}
                        />
                        {!isRunning && (
                            <button
                                onClick={handleStart}
                                className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Start Simulation
                            </button>
                        )}
                        {isRunning && (
                            <>
                                <button
                                    onClick={handlePauseResume}
                                    className="px-4 py-2 rounded-xl bg-yellow-500 text-white hover:bg-yellow-600"
                                >
                                    {isPaused ? "Resume" : "Pause"}
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
                                >
                                    Reset
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Summary (live) */}
            {segments.length > 0 && (
                <div className="mt-6 bg-white/70 rounded-2xl shadow p-4">
                    <h2 className="font-semibold mb-3">Gantt Chart (live)</h2>
                    <div className="w-full border rounded-xl p-3 overflow-x-auto">
                        <div className="relative h-16 min-w-[400px] flex items-stretch">
                            {/* time ruler */}
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="flex h-full">
                                    {Array.from({ length: totalTime + 1 }).map((_, i) => (
                                        <div key={i} className="relative" style={{ width: 40 }}>
                                            <div className="absolute -bottom-6 text-[10px] text-gray-500">
                                                {i}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* segments */}
                            <div className="flex h-full">
                                {segments.map((s, idx) => {
                                    const width = (s.end - s.start) * 40;
                                    return (
                                        <div
                                            key={idx}
                                            className="h-full border rounded-lg mr-1 flex items-center justify-center text-xs font-semibold"
                                            style={{ width }}
                                            title={`${s.id}: ${s.start} → ${s.end}`}
                                        >
                                            {s.id}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {metrics && (
                        <div className="mt-4">
                            <h3 className="font-medium">Metrics</h3>
                            <div className="overflow-x-auto mt-2">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="text-left border-b">
                                            <th className="py-2 pr-4">PID</th>
                                            <th className="py-2 pr-4">AT</th>
                                            <th className="py-2 pr-4">BT</th>
                                            <th className="py-2 pr-4">CT</th>
                                            <th className="py-2 pr-4">TAT</th>
                                            <th className="py-2 pr-4">WT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {metrics.rowsCalc.map((r) => (
                                            <tr key={r.id} className="border-b last:border-0">
                                                <td className="py-1 pr-4">{r.id}</td>
                                                <td className="py-1 pr-4">{r.arrival}</td>
                                                <td className="py-1 pr-4">{r.burst}</td>
                                                <td className="py-1 pr-4">{r.completion}</td>
                                                <td className="py-1 pr-4">{r.tat}</td>
                                                <td className="py-1 pr-4">{r.wt}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="text-sm text-gray-700 mt-2">
                                    <span className="mr-4">
                                        Avg WT: <b>{metrics.avgWT}</b>
                                    </span>
                                    <span>
                                        Avg TAT: <b>{metrics.avgTAT}</b>
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Simulation Modal */}
            <AnimatePresence>
                {showSim && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl p-6"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Live Simulation</h2>
                                <button
                                    className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                                    onClick={() => setShowSim(false)}
                                >
                                    Close
                                </button>
                            </div>
                            <div className="mt-1 text-sm text-gray-600">
                                Time: <b>{time}</b> • Speed: {speed.toFixed(1)}x
                            </div>

                            {/* CPU & Queue */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-1">
                                    <div className="p-4 rounded-2xl border h-40 flex flex-col items-center justify-center bg-gray-50">
                                        <div className="text-xs text-gray-500 mb-2">CPU</div>
                                        <div className="h-16 w-32 border rounded-xl bg-white flex items-center justify-center">
                                            {running ? (
                                                <motion.div
                                                    key={running.id}
                                                    animate={{ scale: [1, 1.15, 1] }}
                                                    transition={{ duration: 1.2, repeat: Infinity }}
                                                    className="px-4 py-2 rounded-lg font-semibold bg-blue-600 text-white"
                                                >
                                                    {running.id}
                                                </motion.div>
                                            ) : (
                                                <span className="text-xs text-gray-500">IDLE</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <div className="p-4 rounded-2xl border h-40 bg-gray-50">
                                        <div className="text-xs text-gray-500 mb-2">
                                            Ready Queue (RR)
                                        </div>
                                        <div className="flex items-center gap-2 overflow-x-auto h-24">
                                            <AnimatePresence initial={false}>
                                                {readyQueue.map((p) => (
                                                    <motion.div
                                                        key={p.id}
                                                        layout
                                                        initial={{ opacity: 0, y: 8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -8 }}
                                                        className="px-4 py-2 rounded-xl bg-yellow-400/90 font-semibold shadow"
                                                    >
                                                        {p.id}
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Live log */}
                            <div className="mt-6 p-4 rounded-2xl border bg-gray-50 h-40 overflow-auto text-sm">
                                <div className="text-xs text-gray-500 mb-2">Event Log</div>
                                <ul className="space-y-1">
                                    {log
                                        .slice()
                                        .reverse()
                                        .map((line, i) => (
                                            <li key={i} className="font-mono">
                                                {line}
                                            </li>
                                        ))}
                                </ul>
                            </div>

                            {/* Controls */}
                            <div className="mt-6 flex items-center gap-3 justify-end">
                                {isRunning && (
                                    <button
                                        onClick={handlePauseResume}
                                        className="px-4 py-2 rounded-xl bg-yellow-500 text-white hover:bg-yellow-600"
                                    >
                                        {isPaused ? "Resume" : "Pause"}
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowSim(false)}
                                    className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
                                >
                                    Minimize
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="px-4 py-2 rounded-xl bg-gray-800 text-white hover:bg-black"
                                >
                                    Reset
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
} 