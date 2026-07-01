import { useState, useCallback, useEffect } from "react";
import { useAgenda } from "../hooks/useAgenda";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { useBackendHealth } from "../hooks/useBackendHealth";
import { useToast } from "../context/ToastContext";
import { apiUrl } from "../config/api";
import BackendOfflineBanner from "../components/agenda/BackendOfflineBanner";
import AgendaHeader from "../components/agenda/AgendaHeader";
import CalendarToolbar from "../components/agenda/CalendarToolbar";
import DoctorTabs from "../components/agenda/DoctorTabs";
import AgendaCalendar from "../components/agenda/AgendaCalendar";
import AgendaLegend from "../components/agenda/AgendaLegend";
import ConsultaModal from "../components/agenda/ConsultaModal";
import BloqueioModal from "../components/agenda/BloqueioModal";
import ModalNovaAgenda from "../components/ModalNovaAgenda";
import { Plus } from "lucide-react";
import {
  getConsultaSyncMessage,
  getBloqueioSyncMessage,
} from "../utils/googleSyncMessages";

export default function AgendaPage() {
  const agenda = useAgenda();
  const { showToast } = useToast();
  const [consultaOpen, setConsultaOpen] = useState(false);
  const [bloqueioOpen, setBloqueioOpen] = useState(false);
  const [agendas, setAgendas] = useState([]);
  const [agendaSelecionada, setAgendaSelecionada] = useState("");
  const [modalAgendaAberto, setModalAgendaAberto] = useState(false);

  // Load agendas
  useEffect(() => {
    fetch(apiUrl("/api/agendas/lista"))
      .then((r) => r.json())
      .then((d) => setAgendas(d.agendas || []))
      .catch(() => {});
  }, [modalAgendaAberto]);

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

      {/* Agenda Selector */}
      <div className="px-6 py-3 bg-white border-b border-slate-200 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500">Agenda:</label>
          <select
            data-testid="seletor-agenda"
            value={agendaSelecionada}
            onChange={(e) => setAgendaSelecionada(e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-surgical-blue/30 bg-white min-w-[160px]"
          >
            <option value="">Todas</option>
            {agendas.map((a) => (
              <option
                key={a.id}
                value={a.id}
                data-testid={`agenda-item-${a.id}`}
              >
                {a.nome}
              </option>
            ))}
          </select>
        </div>

        <button
          data-testid="btn-adicionar-agenda"
          onClick={() => setModalAgendaAberto(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-surgical-blue border border-surgical-blue/30 rounded-lg hover:bg-surgical-blue/10 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar Agenda
        </button>

        <div className="flex gap-1.5 ml-2 flex-wrap">
          {agendas.map((a) => (
            <button
              key={a.id}
              onClick={() => setAgendaSelecionada(a.id)}
              className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded-full border transition-colors ${
                agendaSelecionada === a.id
                  ? "border-surgical-blue bg-surgical-blue/10"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: a.cor }}
              />
              {a.nome}
            </button>
          ))}
        </div>
      </div>

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

      <ModalNovaAgenda
        isOpen={modalAgendaAberto}
        onClose={() => setModalAgendaAberto(false)}
        onSuccess={() => {
          setModalAgendaAberto(false);
        }}
      />
    </div>
  );
}
