import { useCallback, useEffect, useState } from "react";
import {
  connectKommo,
  createPatient,
  fetchPatientById,
  fetchPatients,
} from "../api/patients";
import PatientList from "../components/patients/PatientList";
import PatientFormModal from "../components/patients/PatientFormModal";
import PatientDetailsDrawer from "../components/patients/PatientDetailsDrawer";
import CrmConnectModal from "../components/patients/CrmConnectModal";
import LoadingSpinner from "../components/patients/LoadingSpinner";

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [crmOpen, setCrmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPatients();
      setPatients(data.patients ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedPatient(null);
      return;
    }

    let cancelled = false;
    setDetailsLoading(true);

    fetchPatientById(selectedId)
      .then((data) => {
        if (!cancelled) setSelectedPatient(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setDetailsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreatePatient = async (payload) => {
    await createPatient(payload);
    await loadPatients();
    showToast("Paciente cadastrado com sucesso.");
  };

  const handleConnectKommo = async (payload) => {
    await connectKommo(payload);
    showToast("CRM Kommo conectado com sucesso.");
  };

  return (
    <div className="flex-1 bg-slate-50">
      <div id="wrapper" className="fuse-content max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Gestão de Pacientes
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setCrmOpen(true)}
              className="px-4 py-2.5 text-sm font-medium border border-slate-200 rounded-lg hover:bg-white text-slate-700"
              aria-label="Conectar CRM Kommo"
            >
              Conectar CRM Kommo
            </button>
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg"
              aria-label="Cadastrar novo paciente"
            >
              Cadastrar Novo Paciente
            </button>
          </div>
        </div>

        {toast && (
          <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2">
            {toast}
          </div>
        )}

        {error && !loading && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">
            {error}
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          {loading ? (
            <LoadingSpinner label="Carregando pacientes..." />
          ) : (
            <PatientList patients={patients} onSelectPatient={setSelectedId} />
          )}
        </div>
      </div>

      <PatientFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreatePatient}
      />

      <CrmConnectModal
        open={crmOpen}
        onClose={() => setCrmOpen(false)}
        onSubmit={handleConnectKommo}
      />

      {(selectedId || detailsLoading) && (
        <PatientDetailsDrawer
          patient={selectedPatient}
          loading={detailsLoading}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
