import { useState, useCallback } from "react";
import { useAgenda } from "../hooks/useAgenda";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { useBackendHealth } from "../hooks/useBackendHealth";
import { useToast } from "../context/ToastContext";
import BackendOfflineBanner from "../components/agenda/BackendOfflineBanner";
import AgendaHeader from "../components/agenda/AgendaHeader";
import CalendarToolbar from "../components/agenda/CalendarToolbar";
import DoctorTabs from "../components/agenda/DoctorTabs";
import AgendaCalendar from "../components/agenda/AgendaCalendar";
import AgendaLegend from "../components/agenda/AgendaLegend";
import ConsultaModal from "../components/agenda/ConsultaModal";
import BloqueioModal from "../components/agenda/BloqueioModal";
import {
  getConsultaSyncMessage,
  getBloqueioSyncMessage,
} from "../utils/googleSyncMessages";

export default function AgendaPage() {
  const agenda = useAgenda();
  const { showToast } = useToast();
  const [consultaOpen, setConsultaOpen] = useState(false);
  const [bloqueioOpen, setBloqueioOpen] = useState(false);

  const activeDoctorId = agenda.doctorFilter ?? 1;
  const onToast = useCallback((msg, type) => showToast(msg, type), [showToast]);
  const googleAuth = useGoogleAuth(activeDoctorId, { onToast });
  const backend = useBackendHealth();

  const activeDoctorName = agenda.medicos[activeDoctorId] ?? null;

  const handleConsulta = async (form) => {
    try {
      const result = await agenda.scheduleConsulta({
        ...form,
        doctor_id: Number(form.doctor_id),
        paciente_id: form.paciente_id,
        clinic_id: form.clinic_id ?? 1,
      });
      const { message, type } = getConsultaSyncMessage(result.google_sync);
      showToast(message, type);
    } catch (err) {
      showToast(err.message, "error");
      throw err;
    }
  };

  const handleBloqueio = async (form) => {
    try {
      const result = await agenda.scheduleBloqueio({
        ...form,
        doctor_id: Number(form.doctor_id),
      });
      const { message, type } = getBloqueioSyncMessage(
        result.google_sync,
        result.total,
      );
      showToast(message, type);
    } catch (err) {
      showToast(err.message, "error");
      throw err;
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-slate-50">
      {backend.online === false && (
        <BackendOfflineBanner onRetry={backend.ping} />
      )}

      <AgendaHeader
        searchTerm={agenda.searchTerm}
        onSearchChange={agenda.setSearchTerm}
        onNewConsulta={() => setConsultaOpen(true)}
        onNewBloqueio={() => setBloqueioOpen(true)}
        googleAuth={googleAuth}
        doctorName={activeDoctorName}
      />

      <CalendarToolbar
        dateLabel={agenda.dateLabel}
        view={agenda.view}
        onViewChange={agenda.setView}
        onNavigate={agenda.navigate}
        onToday={agenda.goToday}
      />

      <DoctorTabs medicos={agenda.medicos} />

      {agenda.loading && (
        <div className="px-6 py-2 text-xs text-slate-500 animate-pulse">
          Carregando eventos...
        </div>
      )}

      <AgendaCalendar
        events={agenda.events}
        view={agenda.view}
        currentDate={agenda.currentDate}
        onNavigate={agenda.setCurrentDate}
        onViewChange={agenda.setView}
      />

      <AgendaLegend />

      <ConsultaModal
        open={consultaOpen}
        onClose={() => setConsultaOpen(false)}
        onSubmit={handleConsulta}
        defaultDate={agenda.currentDate}
      />

      <BloqueioModal
        open={bloqueioOpen}
        onClose={() => setBloqueioOpen(false)}
        onSubmit={handleBloqueio}
        defaultDate={agenda.currentDate}
      />
    </div>
  );
}
