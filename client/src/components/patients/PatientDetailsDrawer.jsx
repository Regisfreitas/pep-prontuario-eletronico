import LoadingSpinner from './LoadingSpinner';

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('pt-BR');
}

export default function PatientDetailsDrawer({ patient, loading, onClose }) {
  if (!patient && !loading) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        data-testid="patient-details-overlay"
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Detalhes do paciente"
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Detalhes do Paciente</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Fechar detalhes do paciente"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <LoadingSpinner label="Carregando detalhes..." />
          ) : (
            <dl className="space-y-5">
              <DetailItem label="Nome" value={patient.full_name} />
              <DetailItem label="Idade" value={`${patient.age} anos`} />
              <DetailItem label="Data de nascimento" value={formatDate(patient.birth_date)} />
              <DetailItem label="E-mail" value={patient.email || '—'} />
              <DetailItem label="Telefone" value={patient.phone || '—'} />
              <DetailItem label="Documento (CPF)" value={patient.document || '—'} />
              <DetailItem
                label="Status de Integração"
                value={patient.integration_status}
                highlight={patient.kommo_id ? 'success' : 'muted'}
              />
              {patient.kommo_id && (
                <DetailItem label="Kommo ID" value={patient.kommo_id} />
              )}
            </dl>
          )}
        </div>
      </aside>
    </>
  );
}

function DetailItem({ label, value, highlight }) {
  const valueCls =
    highlight === 'success'
      ? 'text-emerald-700 font-medium'
      : highlight === 'muted'
        ? 'text-slate-500'
        : 'text-slate-800';

  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className={`mt-1 text-sm ${valueCls}`}>{value}</dd>
    </div>
  );
}
