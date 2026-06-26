import { useState } from "react";
import PrescriptionForm from "./PrescriptionForm";

export default function PrescriptionModal() {
  const [activeTab, setActiveTab] = useState("simple");

  return (
    <div
      className="flex flex-col h-full"
      data-testid="prescription-modal"
      role="region"
      aria-label="Modal de Prescrição"
    >
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">
          {activeTab === "simple"
            ? "Prescrição Simples"
            : "Prescrição de Controlados"}
        </h2>
      </div>

      {/* Submenu tabs */}
      <nav
        className="flex border-b border-slate-200 bg-white px-6"
        role="tablist"
        aria-label="Tipos de Prescrição"
      >
        <button
          role="tab"
          aria-selected={activeTab === "simple"}
          data-testid="prescription-tab-simple"
          onClick={() => setActiveTab("simple")}
          className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === "simple"
              ? "border-medical-600 text-medical-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Prescrição Simples
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "controlled"}
          data-testid="prescription-tab-controlled"
          onClick={() => setActiveTab("controlled")}
          className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === "controlled"
              ? "border-medical-600 text-medical-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Prescrição de Controlados
        </button>
      </nav>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-white">
        <PrescriptionForm mode={activeTab} />
      </div>
    </div>
  );
}
