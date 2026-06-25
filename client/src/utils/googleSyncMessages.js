export function getConsultaSyncMessage(googleSync) {
  if (!googleSync) return { message: 'Consulta agendada com sucesso!', type: 'success' };

  if (googleSync.synced) {
    return { message: 'Consulta agendada e sincronizada com Google Agenda!', type: 'success' };
  }

  if (googleSync.warning) {
    return {
      message:
        'Consulta salva. Verifique o Google Agenda — a sincronização pode ter concluído apesar do aviso de rede.',
      type: 'info',
    };
  }

  if (googleSync.skipped && googleSync.reason === 'not_connected') {
    return { message: 'Consulta agendada (Google Agenda não conectado).', type: 'info' };
  }

  if (googleSync.error) {
    return {
      message: `Consulta salva, mas falhou no Google: ${googleSync.error}`,
      type: 'error',
    };
  }

  return { message: 'Consulta agendada com sucesso!', type: 'success' };
}

export function getBloqueioSyncMessage(googleSync, total) {
  if (!googleSync) {
    return { message: `${total} bloqueio(s) criado(s) com sucesso!`, type: 'success' };
  }

  if (googleSync.synced > 0 && googleSync.failed === 0) {
    return {
      message: `${total} bloqueio(s) criado(s) e sincronizado(s) com Google Agenda!`,
      type: 'success',
    };
  }

  if (googleSync.synced > 0 && googleSync.failed > 0) {
    return {
      message: `${googleSync.synced} sincronizado(s), ${googleSync.failed} falhou(ram) no Google.`,
      type: 'error',
    };
  }

  if (googleSync.skipped === total) {
    return {
      message: `${total} bloqueio(s) criado(s) (Google Agenda não conectado).`,
      type: 'info',
    };
  }

  if (googleSync.failed > 0) {
    return {
      message: `Bloqueios salvos, mas ${googleSync.failed} falhou(ram) no Google.`,
      type: 'error',
    };
  }

  return { message: `${total} bloqueio(s) criado(s) com sucesso!`, type: 'success' };
}
