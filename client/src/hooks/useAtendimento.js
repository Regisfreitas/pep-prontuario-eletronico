import { useCallback, useEffect, useRef, useState } from "react";
import { EMPTY_DRAFTS } from "../constants/tabs";

const API = "/api";
const DEBOUNCE_MS = 1500;

export function useAtendimento() {
  const [phase, setPhase] = useState("entry");
  const [atendimentoId, setAtendimentoId] = useState(null);
  const [pacienteId, setPacienteId] = useState(null);
  const [drafts, setDrafts] = useState(EMPTY_DRAFTS);
  const [activeTab, setActiveTab] = useState("anamnese");
  const [saveStatus, setSaveStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [finalizing, setFinalizing] = useState(false);
  const [finalizedUrls, setFinalizedUrls] = useState(null);
  const [finalizedSigned, setFinalizedSigned] = useState(false);

  const debounceRef = useRef(null);
  const draftsRef = useRef(drafts);
  const activeTabRef = useRef(activeTab);
  const atendimentoIdRef = useRef(atendimentoId);

  useEffect(() => {
    draftsRef.current = drafts;
  }, [drafts]);
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);
  useEffect(() => {
    atendimentoIdRef.current = atendimentoId;
  }, [atendimentoId]);

  const clearDebounce = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  const saveDraft = useCallback(async (module, content) => {
    const id = atendimentoIdRef.current;
    if (!id) return;
    setSaveStatus("saving");
    try {
      const res = await fetch(`${API}/rascunho`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ atendimento_id: id, module, content }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Falha ao salvar rascunho");
      }
      setSaveStatus("saved");
      setError(null);
    } catch (err) {
      setSaveStatus("error");
      setError(err.message);
    }
  }, []);

  const scheduleSave = useCallback(
    (module, content) => {
      clearDebounce();
      debounceRef.current = setTimeout(
        () => saveDraft(module, content),
        DEBOUNCE_MS,
      );
    },
    [clearDebounce, saveDraft],
  );

  const iniciarAtendimento = useCallback(async (pid) => {
    setError(null);
    setSaveStatus("saving");
    try {
      const res = await fetch(`${API}/iniciar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medico_id: 1, paciente_id: pid }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Falha ao iniciar atendimento");
      }
      const data = await res.json();
      setAtendimentoId(data.atendimento_id);
      setPacienteId(data.paciente_id);
      setDrafts(data.drafts ?? EMPTY_DRAFTS);
      setPhase("workspace");
      setSaveStatus("saved");
    } catch (err) {
      setSaveStatus("error");
      setError(err.message);
    }
  }, []);

  const updateDraft = useCallback(
    (module, texto) => {
      const content = { texto };
      setDrafts((prev) => ({ ...prev, [module]: content }));
      scheduleSave(module, content);
    },
    [scheduleSave],
  );

  const switchTab = useCallback(
    (tabId) => {
      clearDebounce();
      setActiveTab(tabId);
      setSaveStatus("idle");
    },
    [clearDebounce],
  );

  const finalizarAtendimento = useCallback(
    async (signed = false) => {
      const id = atendimentoIdRef.current;
      if (!id) return;
      clearDebounce();
      setFinalizing(true);
      setError(null);
      setFinalizedSigned(signed);
      try {
        const pendingModule = activeTabRef.current;
        const pendingContent = draftsRef.current[pendingModule];
        await saveDraft(pendingModule, pendingContent);
        const res = await fetch(`${API}/finalizar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ atendimento_id: id, signed }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Falha ao finalizar atendimento");
        }
        const data = await res.json();
        setFinalizedUrls(data.urls);
        setPhase("finalized");
      } catch (err) {
        setError(err.message);
      } finally {
        setFinalizing(false);
      }
    },
    [clearDebounce, saveDraft],
  );

  useEffect(() => () => clearDebounce(), [clearDebounce]);

  return {
    phase,
    atendimentoId,
    pacienteId,
    drafts,
    activeTab,
    saveStatus,
    error,
    finalizing,
    finalizedUrls,
    finalizedSigned,
    iniciarAtendimento,
    updateDraft,
    switchTab,
    finalizarAtendimento,
  };
}
