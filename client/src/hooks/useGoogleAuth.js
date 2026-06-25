import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  fetchGoogleStatus,
  disconnectGoogle,
  getGoogleAuthUrl,
} from '../api/google';
import { checkBackendHealth } from '../config/api';

export function useGoogleAuth(doctorId, { onToast } = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState({ connected: false, loading: true });
  const [disconnecting, setDisconnecting] = useState(false);

  const loadStatus = useCallback(async () => {
    if (!doctorId) {
      setStatus({ connected: false, loading: false });
      return;
    }

    setStatus((s) => ({ ...s, loading: true }));
    try {
      const data = await fetchGoogleStatus(doctorId);
      setStatus({
        connected: data.connected,
        google_calendar_id: data.google_calendar_id,
        nome: data.nome,
        loading: false,
      });
    } catch {
      setStatus({ connected: false, loading: false });
    }
  }, [doctorId]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    const googleParam = searchParams.get('google');
    if (!googleParam) return;

    if (googleParam === 'success') {
      onToast?.('Google Agenda conectado com sucesso!', 'success');
      loadStatus();
    } else if (googleParam === 'error') {
      const message = searchParams.get('message') || 'Erro ao conectar Google Agenda';
      onToast?.(decodeURIComponent(message), 'error');
    }

    searchParams.delete('google');
    searchParams.delete('message');
    searchParams.delete('doctor_id');
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams, onToast, loadStatus]);

  const connect = useCallback(async () => {
    const online = await checkBackendHealth();
    if (!online) {
      onToast?.(
        'Back-end offline. Execute "npm run dev" na pasta pep-emr e aguarde a porta 3001 subir.',
        'error'
      );
      return;
    }
    window.location.href = getGoogleAuthUrl(doctorId);
  }, [doctorId, onToast]);

  const disconnect = useCallback(async () => {
    setDisconnecting(true);
    try {
      await disconnectGoogle(doctorId);
      setStatus({ connected: false, loading: false });
      onToast?.('Google Agenda desconectado.', 'info');
    } catch (err) {
      onToast?.(err.message, 'error');
      throw err;
    } finally {
      setDisconnecting(false);
    }
  }, [doctorId, onToast]);

  return {
    connected: status.connected,
    loading: status.loading,
    disconnecting,
    calendarId: status.google_calendar_id,
    connect,
    disconnect,
    reload: loadStatus,
  };
}
