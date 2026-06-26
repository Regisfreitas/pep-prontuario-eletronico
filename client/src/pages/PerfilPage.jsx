import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Building2, CreditCard, FileText } from "lucide-react";
import { apiUrl } from "../config/api";

const VALID_TABS = ["prescritor", "conselho", "contato"]; // these have forms

const BOARD_TYPES = ["CRM", "CRO", "CRP", "COREN"];

const GENDER_OPTIONS = [
  { value: "", label: "Selecionar" },
  { value: "Masculino", label: "Masculino" },
  { value: "Feminino", label: "Feminino" },
];

// ---------- Mask helpers ----------
function maskCpf(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}
function maskPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10)
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/^(\d{2})\s(\d{4})(\d)/, "($1) $2-$3");
  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/^(\d{2})\s(\d{5})(\d)/, "($1) $2-$3");
}
function unmask(v) {
  return v.replace(/\D/g, "");
}

// ---------- Reusable ----------
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
  "w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-600/30 focus:border-medical-600";

// ---------- Page ----------
const PLACEHOLDER_TABS = {
  clinicas: {
    label: "Minhas Clínicas",
    icon: Building2,
    description: "Gerencie os dados cadastrais e crie novas unidades.",
  },
  assinaturas: {
    label: "Planos e Assinaturas",
    icon: CreditCard,
    description: "Faça upgrade de conta e contrate créditos de IA.",
  },
  layouts: {
    label: "Meus Layouts",
    icon: FileText,
    description: "Personalize os templates dos documentos impressos.",
  },
};

export default function PerfilPage() {
  const { tab: rawTab } = useParams();
  const tab = rawTab || "prescritor";

  // Placeholder tabs (em construção)
  if (PLACEHOLDER_TABS[tab]) {
    return <PlaceholderPage tab={tab} meta={PLACEHOLDER_TABS[tab]} />;
  }

  // Form tabs
  return <PerfilForm key={tab} initialTab={tab} />;
}

function PlaceholderPage({ tab, meta }) {
  const Icon = meta.icon;
  return (
    <div className="flex flex-col flex-1 bg-slate-50">
      <div className="px-8 py-6 bg-white border-b border-slate-200">
        <p className="text-xs text-slate-400 mb-1">
          SoMed &gt; Perfil &gt; {meta.label}
        </p>
        <h1 className="text-2xl font-bold text-slate-800">{meta.label}</h1>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-medical-50 flex items-center justify-center">
            {Icon && <Icon size={32} className="text-medical-600" />}
          </div>
          <h2 className="text-lg font-semibold text-slate-700 mb-2">
            {meta.label}
          </h2>
          <p className="text-sm text-slate-500 mb-4">{meta.description}</p>
          <span className="inline-block px-3 py-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full">
            Em breve
          </span>
        </div>
      </div>
    </div>
  );
}

function PerfilForm({ initialTab }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
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
          specialty_id: profile.specialty_id
            ? String(profile.specialty_id)
            : "",
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
  }, []);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

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

  return (
    <div className="flex flex-col flex-1 bg-slate-50">
      {/* Page header */}
      <div className="px-8 py-6 bg-white border-b border-slate-200">
        <p className="text-xs text-slate-400 mb-1">SoMed &gt; Perfil</p>
        <h1 className="text-2xl font-bold text-slate-800">Perfil do Médico</h1>
      </div>

      <div className="flex-1 p-8 max-w-2xl">
        {loading ? (
          <div
            className="flex flex-col items-center justify-center py-16"
            data-testid="profile-loading"
            role="status"
            aria-label="Carregando perfil"
          >
            <div className="w-10 h-10 border-4 border-medical-100 border-t-medical-600 rounded-full animate-spin" />
            <p className="mt-4 text-sm text-slate-500">Carregando perfil...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Tab header (inline navigation) */}
            <div className="flex border-b border-slate-200">
              {[
                { id: "prescritor", label: "Dados do Prescritor" },
                { id: "conselho", label: "Dados do Conselho" },
                { id: "contato", label: "Dados de Contato" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`px-6 py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                    activeTab === t.id
                      ? "border-medical-600 text-medical-600"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-5">
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

              {/* Tab 1 */}
              {activeTab === "prescritor" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Nome">
                      <input
                        type="text"
                        value={form.first_name}
                        onChange={(e) => set("first_name", e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Sobrenome">
                      <input
                        type="text"
                        value={form.last_name}
                        onChange={(e) => set("last_name", e.target.value)}
                        className={inputCls}
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
                      maxLength={14}
                    />
                  </Field>
                  <Field label="Data de Nascimento">
                    <input
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
                      {GENDER_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </>
              )}

              {/* Tab 2 */}
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
                    />
                  </Field>
                </>
              )}

              {/* Tab 3 */}
              {activeTab === "contato" && (
                <>
                  <Field label="E-mail">
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Telefone / Celular">
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => set("phone", maskPhone(e.target.value))}
                      className={inputCls}
                      maxLength={15}
                    />
                  </Field>
                </>
              )}

              {/* Save button */}
              <div className="pt-2">
                <button
                  type="button"
                  data-testid="btn-save-profile"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 bg-medical-600 hover:bg-medical-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
