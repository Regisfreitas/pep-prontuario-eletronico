import { Link } from 'react-router-dom';
import { useAtendimento } from '../hooks/useAtendimento';
import EntryGate from '../components/EntryGate';
import Workspace from '../components/Workspace';
import FinalizedView from '../components/FinalizedView';

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

  const nav = (
    <nav className="px-6 py-2 bg-medical-800 text-white text-sm flex gap-4">
      <Link to="/agenda" className="opacity-70 hover:opacity-100">Agenda</Link>
      <Link to="/" className="font-semibold opacity-100">Atendimento</Link>
    </nav>
  );

  if (phase === 'entry') {
    return (
      <>
        {nav}
        <EntryGate
          onStart={iniciarAtendimento}
          loading={saveStatus === 'saving'}
          error={error}
        />
      </>
    );
  }

  if (phase === 'finalized') {
    return (
      <>
        {nav}
        <FinalizedView
          atendimentoId={atendimentoId}
          urls={finalizedUrls}
          onNewSession={() => window.location.reload()}
        />
      </>
    );
  }

  return (
    <>
      {nav}
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
    </>
  );
}
