import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchPatientById } from '../api/patients';
import { fetchMemedToken, getMemedScriptUrl } from '../api/memed';

const MEDICO_ID = 1;

function normalizeCpf(value) {
  if (!value) return '';
  return value.replace(/\D/g, '');
}

function formatDateToMemed(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;
  return `${year}-${month}-${day}`;
}

export default function MemedPrescription({ pacienteId }) {
  const [state, setState] = useState({
    phase: 'loading',
    error: null,
    token: null,
    patient: null,
  });
  const scriptRef = useRef(null);
  const initializedRef = useRef(false);

  const handleModuleInit = useCallback(
    (event) => {
      if (event.detail?.module !== 'plataforma.prescricao') return;
      if (initializedRef.current) return;

      initializedRef.current = true;

      try {
        const patient = state.patient;
        if (!patient || !window.MdHub) {
          setState((s) => ({ ...s, phase: 'error', error: 'Dados do paciente não disponíveis' }));
          return;
        }

        const pacienteData = {
          id_externo: patient.id,
          nome: patient.full_name,
          cpf: normalizeCpf(patient.document),
          sexo: patient.sexo || '',
          nascimento: formatDateToMemed(patient.birth_date),
        };

        window.MdHub.on('core:modulesLoaded', () => {
          window.MdHub.module.setPaciente(pacienteData);
          window.MdHub.module.show('plataforma.prescricao');
        });

        setState((s) => ({ ...s, phase: 'ready' }));
      } catch (err) {
        setState((s) => ({ ...s, phase: 'error', error: err.message }));
      }
    },
    [state.patient]
  );

  // Fetch patient data and memed token → inject script
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // 1. Buscar dados do paciente
        let patient = null;
        if (pacienteId) {
          try {
            patient = await fetchPatientById(pacienteId);
          } catch {
            // Paciente não encontrado; tenta seguir sem detalhes
          }
        }

        // 2. Buscar token Memed
        const { memed_token } = await fetchMemedToken(MEDICO_ID);

        if (cancelled) return;

        setState({ phase: 'loading', error: null, token: memed_token, patient });

        // 3. Registrar listener antes de injetar script
        document.addEventListener('core:moduleInit', handleModuleInit);

        // 4. Injetar script da Memed
        const script = document.createElement('script');
        script.src = getMemedScriptUrl();
        script.setAttribute('data-token', memed_token);
        script.async = true;
        script.onload = () => {
          if (!cancelled) {
            setState((s) => ({ ...s, phase: 'loaded' }));
          }
        };
        script.onerror = () => {
          if (!cancelled) {
            setState((s) => ({
              ...s,
              phase: 'error',
              error: 'Falha ao carregar o módulo de prescrição. Verifique sua conexão.',
            }));
          }
        };

        document.body.appendChild(script);
        scriptRef.current = script;
      } catch (err) {
        if (!cancelled) {
          setState((s) => ({ ...s, phase: 'error', error: err.message }));
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      document.removeEventListener('core:moduleInit', handleModuleInit);
      if (scriptRef.current?.parentNode) {
        document.body.removeChild(scriptRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pacienteId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      initializedRef.current = false;
    };
  }, []);

  if (state.phase === 'error') {
    return (
      <div
        className="flex flex-col items-center justify-center h-full min-h-[400px] p-8"
        data-testid="memed-error"
        role="alert"
      >
        <div className="w-16 h-16 mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-base font-medium text-slate-800 mb-2">
          Prescrição temporariamente indisponível
        </p>
        <p className="text-sm text-slate-500 text-center max-w-md">{state.error}</p>
      </div>
    );
  }

  if (state.phase === 'ready') {
    return (
      <div
        className="flex flex-col h-full"
        id="memed-prescricao-container"
        role="region"
        aria-label="Módulo de Prescrição Médica"
      >
        <div
          id="plataforma-prescricao"
          className="flex-1 min-h-[500px]"
        />
      </div>
    );
  }

  // Loading state
  return (
    <div
      data-testid="memed-loading"
      className="flex flex-col items-center justify-center h-full min-h-[400px]"
      role="status"
      aria-live="polite"
      aria-label="Carregando prescrição"
    >
      <div className="w-10 h-10 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin" />
      <p className="mt-4 text-sm text-slate-500">Carregando módulo de prescrição...</p>
    </div>
  );
}
