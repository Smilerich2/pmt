"use client";

import { useState, useCallback } from "react";

type GateType = "AND" | "OR" | "NOT" | "NAND" | "NOR" | "XOR";

type Gate = {
  id: string;
  type: GateType;
  x: number;
  y: number;
  inputA: boolean;
  inputB: boolean;
};

function computeOutput(gate: Gate): boolean {
  const a = gate.inputA;
  const b = gate.inputB;
  switch (gate.type) {
    case "AND": return a && b;
    case "OR": return a || b;
    case "NOT": return !a;
    case "NAND": return !(a && b);
    case "NOR": return !(a || b);
    case "XOR": return a !== b;
  }
}

const gateColors: Record<GateType, string> = {
  AND: "bg-blue-100 border-blue-400 text-blue-800",
  OR: "bg-purple-100 border-purple-400 text-purple-800",
  NOT: "bg-orange-100 border-orange-400 text-orange-800",
  NAND: "bg-cyan-100 border-cyan-400 text-cyan-800",
  NOR: "bg-pink-100 border-pink-400 text-pink-800",
  XOR: "bg-amber-100 border-amber-400 text-amber-800",
};

const gateDescriptions: Record<GateType, string> = {
  AND: "Ausgang = 1, wenn BEIDE Eingänge = 1",
  OR: "Ausgang = 1, wenn MINDESTENS EIN Eingang = 1",
  NOT: "Ausgang = Negation des Eingangs",
  NAND: "Ausgang = 0, nur wenn BEIDE Eingänge = 1",
  NOR: "Ausgang = 1, nur wenn BEIDE Eingänge = 0",
  XOR: "Ausgang = 1, wenn Eingänge VERSCHIEDEN sind",
};

const allGates: GateType[] = ["AND", "OR", "NOT", "NAND", "NOR", "XOR"];

const initialGates: Gate[] = [
  { id: "1", type: "AND", x: 0, y: 0, inputA: false, inputB: false },
];

export default function LogicSimulator() {
  const [gates, setGates] = useState<Gate[]>(initialGates);
  const [selectedType, setSelectedType] = useState<GateType>("AND");

  const addGate = useCallback(() => {
    const id = Date.now().toString();
    setGates((prev) => [
      ...prev,
      { id, type: selectedType, x: 0, y: 0, inputA: false, inputB: false },
    ]);
  }, [selectedType]);

  const removeGate = useCallback((id: string) => {
    setGates((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const toggleInput = useCallback((id: string, which: "A" | "B") => {
    setGates((prev) =>
      prev.map((g) =>
        g.id === id
          ? { ...g, inputA: which === "A" ? !g.inputA : g.inputA, inputB: which === "B" ? !g.inputB : g.inputB }
          : g
      )
    );
  }, []);

  const changeType = useCallback((id: string, type: GateType) => {
    setGates((prev) =>
      prev.map((g) => (g.id === id ? { ...g, type } : g))
    );
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-bold text-gray-800">Logik-Gatter Simulator</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Füge Gatter hinzu und schalte Eingänge um, um die Ausgänge zu beobachten.
        </p>
      </div>

      {/* Controls */}
      <div className="px-6 py-4 bg-white border-b border-gray-200 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Gatter:</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as GateType)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {allGates.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <button
            onClick={addGate}
            className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Hinzufügen
          </button>
        </div>
        <div className="text-sm text-gray-400">
          {gates.length} Gatter aktiv
        </div>
      </div>

      {/* Gate cards */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {gates.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">⊞</div>
            <p className="text-sm">Noch keine Gatter. Füge eins hinzu!</p>
          </div>
        )}
        {gates.map((gate) => {
          const output = computeOutput(gate);
          const colorClass = gateColors[gate.type];
          return (
            <div
              key={gate.id}
              className={`rounded-xl border-2 ${colorClass} p-4 shadow-sm`}
            >
              {/* Gate header */}
              <div className="flex items-center justify-between mb-3">
                <select
                  value={gate.type}
                  onChange={(e) => changeType(gate.id, e.target.value as GateType)}
                  className="font-bold text-sm bg-transparent border-0 outline-none cursor-pointer"
                >
                  {allGates.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <button
                  onClick={() => removeGate(gate.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none"
                >
                  ×
                </button>
              </div>

              <p className="text-xs opacity-70 mb-4">{gateDescriptions[gate.type]}</p>

              {/* Inputs */}
              <div className="space-y-2 mb-4">
                <InputToggle
                  label="Eingang A"
                  value={gate.inputA}
                  onToggle={() => toggleInput(gate.id, "A")}
                />
                {gate.type !== "NOT" && (
                  <InputToggle
                    label="Eingang B"
                    value={gate.inputB}
                    onToggle={() => toggleInput(gate.id, "B")}
                  />
                )}
              </div>

              {/* Arrow */}
              <div className="text-center text-gray-400 text-xl mb-3">↓</div>

              {/* Output */}
              <div className={`rounded-lg px-4 py-3 text-center font-bold text-lg ${
                output
                  ? "bg-green-500 text-white shadow-md"
                  : "bg-gray-200 text-gray-500"
              }`}>
                Ausgang: {output ? "1 (HIGH)" : "0 (LOW)"}
              </div>

              {/* Truth table hint */}
              <TruthTable gate={gate} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InputToggle({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border-2 transition-all ${
        value
          ? "border-green-400 bg-green-50 text-green-800"
          : "border-gray-300 bg-gray-50 text-gray-600 hover:border-gray-400"
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
      <span className={`text-sm font-bold px-2 py-0.5 rounded ${
        value ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
      }`}>
        {value ? "1" : "0"}
      </span>
    </button>
  );
}

function TruthTable({ gate }: { gate: Gate }) {
  const [show, setShow] = useState(false);

  const rows =
    gate.type === "NOT"
      ? [
          { a: false, b: false, out: !false },
          { a: true, b: false, out: !true },
        ]
      : [
          { a: false, b: false, out: computeOutput({ ...gate, inputA: false, inputB: false }) },
          { a: false, b: true, out: computeOutput({ ...gate, inputA: false, inputB: true }) },
          { a: true, b: false, out: computeOutput({ ...gate, inputA: true, inputB: false }) },
          { a: true, b: true, out: computeOutput({ ...gate, inputA: true, inputB: true }) },
        ];

  return (
    <div className="mt-3">
      <button
        onClick={() => setShow(!show)}
        className="text-xs opacity-60 hover:opacity-100 transition-opacity underline"
      >
        {show ? "Wahrheitstabelle ausblenden" : "Wahrheitstabelle anzeigen"}
      </button>
      {show && (
        <table className="mt-2 w-full text-xs border-collapse">
          <thead>
            <tr className="bg-black/10">
              <th className="px-2 py-1 text-left">A</th>
              {gate.type !== "NOT" && <th className="px-2 py-1 text-left">B</th>}
              <th className="px-2 py-1 text-left">Ausgang</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className={`${
                  gate.inputA === row.a && (gate.type === "NOT" || gate.inputB === row.b)
                    ? "font-bold bg-yellow-100"
                    : "odd:bg-black/5"
                }`}
              >
                <td className="px-2 py-1">{row.a ? "1" : "0"}</td>
                {gate.type !== "NOT" && <td className="px-2 py-1">{row.b ? "1" : "0"}</td>}
                <td className={`px-2 py-1 ${row.out ? "text-green-700" : "text-gray-500"}`}>
                  {row.out ? "1" : "0"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
