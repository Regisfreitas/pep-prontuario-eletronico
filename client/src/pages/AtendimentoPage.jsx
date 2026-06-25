import { useAtendimento } from "../hooks/useAtendimento";
import EntryGate from "../components/EntryGate";
import Workspace from "../components/Workspace";
import FinalizedView from "../components/FinalizedView";

export default function AtendimentoPage() {
  const {
    phase,
    atendimentoId,
    drafts,
    activeTab,
    saveStatus,
    error,
    finalizing,
    finalizedUrls,
    iniciarAtendimento,
    updateDraft,
    switchTab,
    finalizarAtendimento,
  } = useAtendimento();

  if (phase === "entry") {
    return (
      <EntryGate
        onStart={iniciarAtendimento}
        loading={saveStatus === "saving"}
        error={error}
      />
    );
  }

  if (phase === "finalized") {
    return (
      <FinalizedView
        atendimentoId={atendimentoId}
        urls={finalizedUrls}
        onNewSession={() => window.location.reload()}
      />
    );
  }

  return (
    <Workspace
      activeTab={activeTab}
      drafts={drafts}
      saveStatus={saveStatus}
      finalizing={finalizing}
      error={error}
      onTabChange={switchTab}
      onDraftChange={updateDraft}
      onFinalizar={finalizarAtendimento}
    />
  );
}
