import { useCallback, useEffect, useState } from "react";
import { apiUrl } from "../../config/api";

const TABS = [
  { id: "prescritor", label: "Dados do Prescritor", testId: "tab-prescritor" },
  { id: "conselho", label: "Dados do Conselho", testId: "tab-conselho" },
  { id: "contato", label: "Dados de Contato", testId: "tab-contato" },
];

const BOARD_TYPES = ["CRM", "CRO", "CRP", "COREN"];

const GENDER_OPTIONS = [
  { value: "", label: "Selecionar" },
  { value: "Masculino", label: "Masculino" },
  { value: "Feminino", label: "Feminino" },
];

// ---------- Input masks ----------

function maskCpf(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

function maskPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/^(\d{2})\s(\d{4})(\d)/, "($1) $2-$3");
  }
  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/^(\d{2})\s(\d{5})(\d)/, "($1) $2-$3");
}

function unmask(value) {
  return value.replace(/\D/g, "");
}

// ---------- Input components ----------

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-500 mb-1 block">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600 disabled:bg-slate-50 disabled:text-slate-400";

// ---------- Main Modal ----------

export default function ProfileModal({ open, onClose }) {
  const [activeTab, setActiveTab] = useState("prescritor");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [states, setStates] = useState([]);
  const [specialties, setSpecialties] = useState([]);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    cpf: "",
    birth_date: "",
    gender: "",
    board_type: "CRM",
    crm: "",
    state_id: "",
    specialty_id: "",
    req_number: "",
    email: "",
    phone: "",
  });

  // Fetch profile + support data
  useEffect(() => {
    if (!open) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    Promise.all([
      fetch(apiUrl("/api/profile?doctor_id=1")).then((r) => r.json()),
      fetch(apiUrl("/api/states")).then((r) => r.json()),
      fetch(apiUrl("/api/specialties")).then((r) => r.json()),
    ])
      .then(([profile, statesRes, specRes]) => {
        setForm({
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          cpf: maskCpf(profile.cpf || ""),
          birth_date: profile.birth_date || "",
          gender: profile.gender || "",
          board_type: profile.board_type || "CRM",
          crm: profile.crm || "",
          state_id: profile.state_id ? String(profile.state_id) : "",
          specialty_id: profile.specialty_id ? String(profile.specialty_id) : "",
          req_number: profile.req_number || "",
          email: profile.email || "",
          phone: maskPhone(profile.phone || ""),
        });
        setStates(statesRes.states || []);
        setSpecialties(specRes.specialties || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [open]);

  const set = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = async () => {
    const cpfDigits = unmask(form.cpf);
    const phoneDigits = unmask(form.phone);

    if (!cpfDigits) {
      setError("CPF é obrigatório");
      return;
    }
    if (!form.birth_date) {
      setError("Data de nascimento é obrigatória");
      return;
    }
    if (!form.crm) {
      setError("Número do Conselho é obrigatório");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(apiUrl("/api/profile"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor_id: 1,
          first_name: form.first_name,
          last_name: form.last_name,
          cpf: cpfDigits,
          birth_date: form.birth_date,
          gender: form.gender,
          board_type: form.board_type,
          crm: form.crm,
          state_id: form.state_id,
          specialty_id: form.specialty_id,
          req_number: form.req_number,
          email: form.email,
          phone: phoneDigits,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erro ao salvar perfil");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        data-testid="profile-modal"
        className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Editar Perfil"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-slate-800">Perfil do Médico</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl"
            aria-label="Fechar modal de perfil"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              data-testid={tab.testId}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div
              className="flex flex-col items-center justify-center py-12"
              data-testid="profile-loading"
              role="status"
              aria-label="Carregando perfil"
            >
              <div className="w-10 h-10 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin" />
              <p className="mt-4 text-sm text-slate-500">Carregando perfil...</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Alertas */}
              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3">
                  Perfil salvo com sucesso!
                </div>
              )}

              {/* Tab 1: Dados do Prescritor */}
              {activeTab === "prescritor" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Nome">
                      <input
                        data-testid="input-first-name"
                        type="text"
                        value={form.first_name}
                        onChange={(e) => set("first_name", e.target.value)}
                        className={inputCls}
                        placeholder="Nome"
                      />
                    </Field>
                    <Field label="Sobrenome">
                      <input
                        type="text"
                        value={form.last_name}
                        onChange={(e) => set("last_name", e.target.value)}
                        className={inputCls}
                        placeholder="Sobrenome"
                      />
                    </Field>
                  </div>

                  <Field label="CPF">
                    <input
                      data-testid="input-cpf"
                      type="text"
                      value={form.cpf}
                      onChange={(e) => set("cpf", maskCpf(e.target.value))}
                      className={inputCls}
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                  </Field>

                  <Field label="Data de Nascimento">
                    <input
                      data-testid="input-birth-date"
                      type="date"
                      value={form.birth_date}
                      onChange={(e) => set("birth_date", e.target.value)}
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Sexo">
                    <select
                      value={form.gender}
                      onChange={(e) => set("gender", e.target.value)}
                      className={inputCls}
                    >
                      {GENDER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </>
              )}

              {/* Tab 2: Dados do Conselho */}
              {activeTab === "conselho" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Sigla do Conselho">
                      <select
                        value={form.board_type}
                        onChange={(e) => set("board_type", e.target.value)}
                        className={inputCls}
                      >
                        {BOARD_TYPES.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Número">
                      <input
                        data-testid="input-crm"
                        type="text"
                        value={form.crm}
                        onChange={(e) => set("crm", e.target.value)}
                        className={inputCls}
                        placeholder="000000"
                      />
                    </Field>
                  </div>

                  <Field label="Estado (UF)">
                    <select
                      data-testid="select-uf"
                      value={form.state_id}
                      onChange={(e) => set("state_id", e.target.value)}
                      className={inputCls}
                    >
                      <option value="">Selecionar estado</option>
                      {states.map((s) => (
                        <option key={s.id} value={String(s.id)}>
                          {s.abbreviation} — {s.name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Especialidade">
                    <select
                      data-testid="select-specialty"
                      value={form.specialty_id}
                      onChange={(e) => set("specialty_id", e.target.value)}
                      className={inputCls}
                    >
                      <option value="">Selecionar especialidade</option>
                      {specialties.map((s) => (
                        <option key={s.id} value={String(s.id)}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="REQ (opcional)">
                    <input
                      type="text"
                      value={form.req_number}
                      onChange={(e) => set("req_number", e.target.value)}
                      className={inputCls}
                      placeholder="Número REQ"
                    />
                  </Field>
                </>
              )}

              {/* Tab 3: Dados de Contato */}
              {activeTab === "contato" && (
                <>
                  <Field label="E-mail">
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      className={inputCls}
                      placeholder="medico@exemplo.com"
                    />
                  </Field>

                  <Field label="Telefone / Celular">
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => set("phone", maskPhone(e.target.value))}
                      className={inputCls}
                      placeholder="(11) 99999-9999"
                      maxLength={15}
                    />
                  </Field>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            data-testid="btn-save-profile"
            onClick={handleSave}
            disabled={saving || loading}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
