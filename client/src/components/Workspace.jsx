import { useState } from "react";
import { TABS } from "../constants/tabs";
import Header from "./Header";
import WorkspaceSidebar from "./WorkspaceSidebar";
import SubToolbar from "./SubToolbar";
import RichTextEditor from "./RichTextEditor";
import PrescriptionModal from "./PrescriptionModal";
import SigningModal from "./SigningModal";

export default function Workspace({
  activeTab,
  drafts,
  saveStatus,
  finalizing,
  error,
  onTabChange,
  onDraftChange,
  onFinalizar,
}) {
  const [signingOpen, setSigningOpen] = useState(false);
  const currentTab = TABS.find((t) => t.id === activeTab) ?? TABS[0];
  const currentText = drafts[activeTab]?.texto ?? "";

  const handleFinalizarClick = () => {
    setSigningOpen(true);
  };

  const handleSignDecision = (signed) => {
    setSigningOpen(false);
    onFinalizar(signed);
  };

  return (
    <div className="flex flex-col flex-1">
      <Header
        onFinalizar={handleFinalizarClick}
        finalizing={finalizing}
        saveStatus={saveStatus}
      />
      <SubToolbar />

      {error && (
        <div className="mx-6 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-1">
        <WorkspaceSidebar activeTab={activeTab} onTabChange={onTabChange} />

        <main className="flex-1 flex flex-col min-w-0">
          <div className="px-6 py-4 bg-white border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">
              {currentTab.label}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Conteúdo salvo automaticamente após 1,5s sem digitação
            </p>
          </div>

          <div
            className={`flex-1 ${activeTab === "prescription" ? "" : "bg-white m-4 rounded-xl border border-slate-200 shadow-sm overflow-hidden"}`}
          >
            {activeTab === "prescription" ? (
              <PrescriptionModal />
            ) : (
              <RichTextEditor
                key={activeTab}
                value={currentText}
                onChange={(html) => onDraftChange(activeTab, html)}
                placeholder={`Digite o conteúdo de ${currentTab.shortLabel}...`}
              />
            )}
          </div>
        </main>
      </div>

      <SigningModal
        open={signingOpen}
        onClose={() => setSigningOpen(false)}
        onSign={handleSignDecision}
      />
    </div>
  );
}
