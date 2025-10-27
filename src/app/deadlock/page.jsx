"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DeadlockSimulator() {
  const [processes, setProcesses] = useState(["P1", "P2", "P3"]);
  const [resources, setResources] = useState(["R1", "R2"]);
  // allocation: resource -> process | null
  const [allocation, setAllocation] = useState({ R1: "P1", R2: "P2" });
  // requests: list of { p, r }
  const [requests, setRequests] = useState([{ p: "P1", r: "R2" }, { p: "P2", r: "R1" }]);
  const [log, setLog] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);

  // UI inputs
  const [newProc, setNewProc] = useState("");
  const [newRes, setNewRes] = useState("");
  const [selP, setSelP] = useState("");
  const [selR, setSelR] = useState("");

  const pausedRef = useRef(false);

  // Interactive graph state (Option A)
  const [mode, setMode] = useState("none"); // none | allocate | request | release
  const [firstSel, setFirstSel] = useState(null); // { type: 'P'|'R', id }
  const [procPos, setProcPos] = useState({}); // id -> {x,y}
  const [resPos, setResPos] = useState({}); // id -> {x,y}

  // Initialize default positions when items change
  useEffect(() => {
    setProcPos((prev) => {
      const next = { ...prev };
      processes.forEach((p, i) => {
        if (!next[p]) next[p] = { x: 60, y: 60 + i * 90 };
      });
      // remove deleted
      Object.keys(next).forEach((k) => {
        if (!processes.includes(k)) delete next[k];
      });
      return next;
    });
  }, [processes]);
  useEffect(() => {
    setResPos((prev) => {
      const next = { ...prev };
      resources.forEach((r, i) => {
        if (!next[r]) next[r] = { x: 520, y: 60 + i * 110 };
      });
      Object.keys(next).forEach((k) => {
        if (!resources.includes(k)) delete next[k];
      });
      return next;
    });
  }, [resources]);

  // Wait-for graph: edge P -> Q if P is waiting for a resource held by Q
  const waitForEdges = useMemo(() => {
    const edges = [];
    for (const req of requests) {
      const holder = allocation[req.r] || null;
      if (holder && holder !== req.p) {
        edges.push([req.p, holder]);
      }
    }
    return edges;
  }, [requests, allocation]);

  // Interactive graph: click handler for nodes
  function handleNodeClick(type, id) {
    if (mode === "none") return;

    // Release mode: click a resource to free it
    if (mode === "release") {
      if (type !== 'R') return;
      setAllocation((al) => {
        if (!al[id]) return al;
        const holder = al[id];
        const next = { ...al, [id]: null };
        setLog((l) => [...l, `rel: ${id} from ${holder}`]);
        return next;
      });
      return;
    }

    // Two-step interactions for allocate/request
    if (!firstSel) {
      setFirstSel({ type, id });
      return;
    }

    // If clicking same node again, clear selection
    if (firstSel.type === type && firstSel.id === id) {
      setFirstSel(null);
      return;
    }

    if (mode === 'allocate') {
      // Expect R then P
      if (firstSel.type === 'R' && type === 'P') {
        const r = firstSel.id; const p = id;
        setAllocation((al) => {
          if (al[r]) { setLog((l) => [...l, `alloc-failed: ${r} busy`]); return al; }
          const next = { ...al, [r]: p };
          setLog((l) => [...l, `alloc: ${r} -> ${p}`]);
          return next;
        });
        // remove fulfilled request if existed
        setRequests((rq) => rq.filter((x) => !(x.p === id && x.r === firstSel.id)));
        setFirstSel(null);
      } else {
        // wrong order, restart selection if user clicked an R
        if (type === 'R') setFirstSel({ type, id }); else setFirstSel(null);
      }
    } else if (mode === 'request') {
      // Expect P then R
      if (firstSel.type === 'P' && type === 'R') {
        const p = firstSel.id; const r = id;
        setRequests((rq) => {
          if (rq.some((x) => x.p === p && x.r === r)) return rq;
          const next = [...rq, { p, r }];
          setLog((l) => [...l, `req: ${p} -> ${r}`]);
          return next;
        });
        setFirstSel(null);
      } else {
        // wrong order, restart if user clicked a P
        if (type === 'P') setFirstSel({ type, id }); else setFirstSel(null);
      }
    }
  }

  const deadlockedSet = useMemo(() => {
    // Detect cycles in wait-for graph among processes
    const adj = new Map();
    for (const p of processes) adj.set(p, []);
    for (const [u, v] of waitForEdges) adj.get(u)?.push(v);

    const color = new Map(); // 0 unvisited, 1 visiting, 2 visited
    const inCycle = new Set();

    function dfs(u, stack) {
      color.set(u, 1);
      stack.push(u);
      for (const v of adj.get(u) || []) {
        const c = color.get(v) || 0;
        if (c === 0) {
          dfs(v, stack);
        } else if (c === 1) {
          // found a back edge; mark cycle nodes
          const idx = stack.lastIndexOf(v);
          if (idx !== -1) {
            for (let i = idx; i < stack.length; i++) inCycle.add(stack[i]);
          }
        }
      }
      stack.pop();
      color.set(u, 2);
    }

    for (const p of processes) if (!color.get(p)) dfs(p, []);
    return inCycle;
  }, [processes, waitForEdges]);

  const hasDeadlock = deadlockedSet.size > 0;

  function addProcess() {
    const id = (newProc || `P${processes.length + 1}`).trim();
    if (!id || processes.includes(id)) return;
    setProcesses((ps) => [...ps, id]);
    setNewProc("");
  }

  function addResource() {
    const id = (newRes || `R${resources.length + 1}`).trim();
    if (!id || resources.includes(id)) return;
    setResources((rs) => [...rs, id]);
    setAllocation((al) => ({ ...al, [id]: null }));
    setNewRes("");
  }

  function allocateSelected() {
    if (!selP || !selR) return;
    // allocate only if resource is free
    setAllocation((al) => {
      if (al[selR]) return al; // already held
      const next = { ...al, [selR]: selP };
      setLog((l) => [...l, `alloc: ${selR} -> ${selP}`]);
      return next;
    });
    // remove any fulfilled request for this pair
    setRequests((rq) => rq.filter((x) => !(x.p === selP && x.r === selR)));
  }

  function requestSelected() {
    if (!selP || !selR) return;
    setRequests((rq) => {
      if (rq.some((x) => x.p === selP && x.r === selR)) return rq;
      const next = [...rq, { p: selP, r: selR }];
      setLog((l) => [...l, `req: ${selP} -> ${selR}`]);
      return next;
    });
  }

  function releaseSelected() {
    if (!selR) return;
    setAllocation((al) => {
      if (!al[selR]) return al;
      const holder = al[selR];
      const next = { ...al, [selR]: null };
      setLog((l) => [...l, `rel: ${selR} from ${holder}`]);
      return next;
    });
  }

  function step() {
    // Try to grant any pending request whose resource is free
    // simple FCFS on requests array
    for (let i = 0; i < requests.length; i++) {
      const { p, r } = requests[i];
      if (!allocation[r]) {
        // grant
        const al2 = { ...allocation, [r]: p };
        const rq2 = requests.slice();
        rq2.splice(i, 1);
        setAllocation(al2);
        setRequests(rq2);
        setLog((l) => [...l, `grant: ${r} -> ${p}`]);
        return; // one grant per step to visualize
      }
    }
    // nothing granted this step
    setLog((l) => [...l, `no-op: all requested resources busy`]);
  }

  useEffect(() => {
    if (!isRunning) return;
    const baseMs = 1000;
    const interval = setInterval(() => {
      if (!pausedRef.current) step();
    }, Math.max(200, baseMs / speed));
    return () => clearInterval(interval);
  }, [isRunning, speed, requests, allocation]);

  function reset() {
    setProcesses(["P1", "P2", "P3"]);
    setResources(["R1", "R2"]);
    setAllocation({ R1: "P1", R2: "P2" });
    setRequests([{ p: "P1", r: "R2" }, { p: "P2", r: "R1" }]);
    setLog([]);
    setIsRunning(false);
    setMode("none");
    setFirstSel(null);
    setProcPos({});
    setResPos({});
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold">Deadlock Simulation</h1>
      <p className="text-sm text-gray-600 mt-1">
        Build a Resource Allocation Graph (RAG), add allocations/requests, run steps, and see deadlock detection live.
      </p>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white/70 rounded-2xl shadow p-4">
          <h2 className="font-semibold mb-2">Setup</h2>
          <div className="space-y-3">
            <div className="flex gap-2 items-center">
              <input
                placeholder="Process ID"
                className="border rounded px-2 py-1 w-32"
                value={newProc}
                onChange={(e) => setNewProc(e.target.value)}
              />
              <button className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200" onClick={addProcess}>
                + Add Process
              </button>
            </div>
            <div className="flex gap-2 items-center">
              <input
                placeholder="Resource ID"
                className="border rounded px-2 py-1 w-32"
                value={newRes}
                onChange={(e) => setNewRes(e.target.value)}
              />
              <button className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200" onClick={addResource}>
                + Add Resource
              </button>
            </div>

            <div className="border-t pt-3">
              <div className="text-sm text-gray-600 mb-2">Select</div>
              <div className="flex gap-2 items-center">
                <select className="border rounded px-2 py-1" value={selP} onChange={(e) => setSelP(e.target.value)}>
                  <option value="">Pick Process</option>
                  {processes.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <select className="border rounded px-2 py-1" value={selR} onChange={(e) => setSelR(e.target.value)}>
                  <option value="">Pick Resource</option>
                  {resources.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="mt-2 flex gap-2">
                <button className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={allocateSelected}>
                  Allocate
                </button>
                <button className="px-3 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600" onClick={requestSelected}>
                  Request
                </button>
                <button className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={releaseSelected}>
                  Release
                </button>
              </div>
            </div>

            <div className="border-t pt-3 flex items-center gap-3">
              <label className="text-sm">Speed: {speed.toFixed(1)}x</label>
              <input type="range" min={0.5} max={4} step={0.5} value={speed} onChange={(e) => setSpeed(+e.target.value)} />
              {!isRunning ? (
                <button className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700" onClick={() => setIsRunning(true)}>
                  Run
                </button>
              ) : (
                <button className="px-4 py-2 rounded-xl bg-yellow-500 text-white hover:bg-yellow-600" onClick={() => setIsRunning(false)}>
                  Pause
                </button>
              )}
              <button className="px-4 py-2 rounded-xl bg-gray-800 text-white hover:bg-black" onClick={step}>
                Step
              </button>
              <button className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300" onClick={reset}>
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white/70 rounded-2xl shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Interactive Graph</h2>
            <div className="text-sm">
              Status: {hasDeadlock ? (
                <span className="text-red-600 font-semibold">Deadlock Detected</span>
              ) : (
                <span className="text-green-700 font-semibold">Safe/Progressing</span>
              )}
            </div>
          </div>

          {/* Mode Toolbar */}
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs text-gray-500">Mode:</span>
            <button onClick={() => { setMode("allocate"); setFirstSel(null); }} className={`px-2 py-1 rounded text-sm ${mode==='allocate'?'bg-blue-600 text-white':'bg-gray-100'}`}>Allocate (R→P)</button>
            <button onClick={() => { setMode("request"); setFirstSel(null); }} className={`px-2 py-1 rounded text-sm ${mode==='request'?'bg-yellow-500 text-white':'bg-gray-100'}`}>Request (P→R)</button>
            <button onClick={() => { setMode("release"); setFirstSel(null); }} className={`px-2 py-1 rounded text-sm ${mode==='release'?'bg-gray-800 text-white':'bg-gray-100'}`}>Release (R)</button>
            <button onClick={() => { setMode("none"); setFirstSel(null); }} className={`px-2 py-1 rounded text-sm ${mode==='none'?'bg-gray-300':'bg-gray-100'}`}>Select</button>
            {firstSel && <span className="ml-2 text-xs text-gray-600">Selected: {firstSel.type}{firstSel.id}</span>}
          </div>

          {/* Graph Canvas */}
          <div className="relative w-full h-[420px] border rounded-xl bg-white overflow-hidden">
            {/* SVG edges */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {/* Allocation edges R -> P */}
              {resources.map((r) => {
                const holder = allocation[r];
                if (!holder) return null;
                const rp = resPos[r];
                const pp = procPos[holder];
                if (!rp || !pp) return null;
                const x1 = rp.x + 60, y1 = rp.y + 20;
                const x2 = pp.x + 60, y2 = pp.y + 20;
                return (
                  <g key={`al-${r}`}>
                    <defs>
                      <marker id="arrowG" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
                        <path d="M0,0 L0,6 L6,3 z" fill="#16a34a" />
                      </marker>
                    </defs>
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#16a34a" strokeWidth="2" markerEnd="url(#arrowG)" />
                  </g>
                );
              })}
              {/* Request edges P -> R */}
              {requests.map((q, idx) => {
                const pp = procPos[q.p];
                const rp = resPos[q.r];
                if (!pp || !rp) return null;
                const x1 = pp.x + 60, y1 = pp.y + 20;
                const x2 = rp.x + 60, y2 = rp.y + 20;
                return (
                  <g key={`rq-${idx}`}>
                    <defs>
                      <marker id="arrowY" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
                        <path d="M0,0 L0,6 L6,3 z" fill="#d97706" />
                      </marker>
                    </defs>
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#d97706" strokeWidth="2" strokeDasharray="4 3" markerEnd="url(#arrowY)" />
                  </g>
                );
              })}
            </svg>

            {/* Process nodes */}
            {processes.map((p) => (
              <motion.div
                key={p}
                drag
                dragMomentum={false}
                className={`absolute w-[120px] h-[40px] rounded-xl shadow border flex items-center justify-center cursor-grab ${hasDeadlock && deadlockedSet.has(p) ? 'bg-red-500 text-white' : 'bg-blue-50'}`}
                style={{ left: (procPos[p]?.x ?? 60), top: (procPos[p]?.y ?? 60) }}
                onDragEnd={(_, info) => {
                  const left = (procPos[p]?.x ?? 60) + info.offset.x;
                  const top = (procPos[p]?.y ?? 60) + info.offset.y;
                  setProcPos((pp) => ({ ...pp, [p]: { x: Math.max(0, Math.min(left, 800)), y: Math.max(0, Math.min(top, 360)) } }));
                }}
                onClick={() => handleNodeClick('P', p)}
                whileTap={{ scale: 0.98 }}
              >
                {p}
              </motion.div>
            ))}

            {/* Resource nodes */}
            {resources.map((r) => (
              <motion.div
                key={r}
                drag
                dragMomentum={false}
                className={`absolute w-[120px] h-[40px] rounded-xl shadow border flex items-center justify-center cursor-grab bg-yellow-50`}
                style={{ left: (resPos[r]?.x ?? 520), top: (resPos[r]?.y ?? 60) }}
                onDragEnd={(_, info) => {
                  const left = (resPos[r]?.x ?? 520) + info.offset.x;
                  const top = (resPos[r]?.y ?? 60) + info.offset.y;
                  setResPos((pp) => ({ ...pp, [r]: { x: Math.max(0, Math.min(left, 800)), y: Math.max(0, Math.min(top, 360)) } }));
                }}
                onClick={() => handleNodeClick('R', r)}
                whileTap={{ scale: 0.98 }}
                title={allocation[r] ? `held by ${allocation[r]}` : 'free'}
              >
                {r}
              </motion.div>
            ))}
          </div>

          {/* Details lists */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="border rounded-xl p-3 bg-gray-50">
              <div className="text-xs text-gray-500 mb-2">Allocations (R → P)</div>
              <ul className="text-sm space-y-1">
                {resources.map((r) => (
                  <li key={r}>{r} {allocation[r] ? `→ ${allocation[r]}` : "→ (free)"}</li>
                ))}
              </ul>
            </div>
            <div className="border rounded-xl p-3 bg-gray-50">
              <div className="text-xs text-gray-500 mb-2">Requests (P → R)</div>
              <ul className="text-sm space-y-1">
                {requests.map((q, idx) => (
                  <li key={`${q.p}-${q.r}-${idx}`}>{q.p} → {q.r} {allocation[q.r] ? `(held by ${allocation[q.r]})` : "(free)"}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Wait-for graph view */}
          <div className="mt-4 border rounded-xl p-3 bg-gray-50">
            <div className="text-xs text-gray-500 mb-2">Wait-For Graph (P → Q)</div>
            {waitForEdges.length === 0 ? (
              <div className="text-sm text-gray-500">No waiting edges</div>
            ) : (
              <ul className="text-sm space-y-1">
                {waitForEdges.map(([u, v], i) => (
                  <li key={i}>{u} → {v}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Event log */}
          <div className="mt-4 p-3 border rounded-xl bg-gray-50 h-40 overflow-auto text-sm">
            <div className="text-xs text-gray-500 mb-2">Event Log</div>
            <ul className="space-y-1">
              {log.slice().reverse().map((line, i) => (
                <li key={i} className="font-mono">{line}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

