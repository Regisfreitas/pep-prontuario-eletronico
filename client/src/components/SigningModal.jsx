import { useState } from "react";

export default function SigningModal({ open, onClose, onSign }) {
  const [step, setStep] = useState("confirm"); // confirm | signing | done
  const [error, setError] = useState(null);

  if (!open) return null;

  const handleYes = () => setStep("signing");
  const handleNo = () => {
    onSign(false);
  };

  const handleSign = () => {
    setError(null);
    try {
      // Mock signing — no real WebCrypto or Bry Signer yet
      onSign(true);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (step === "confirm" && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md"
        data-testid="signing-modal"
        role="dialog"
        aria-modal="true"
        aria-label={step === "confirm" ? "Confirmar assinatura" : "Assinatura digital"}
      >
        {/* Step 1: Confirmation */}
        {step === "confirm" && (
          <>
            <div className="px-6 py-5 border-b border-slate-200">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h2
                className="text-lg font-bold text-slate-800 text-center"
                data-testid="signing-modal-title"
              >
                Finalizar Atendimento
              </h2>
              <p className="text-sm text-slate-500 text-center mt-2">
                Deseja assinar digitalmente os documentos deste atendimento?
              </p>
            </div>

            <div className="px-6 py-4 flex justify-center gap-3">
              <button
                type="button"
                onClick={handleNo}
                data-testid="signing-modal-btn-skip"
                className="px-5 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Não, apenas finalizar
              </button>
              <button
                type="button"
                onClick={handleYes}
                data-testid="signing-modal-btn-sign"
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
              >
                Sim, assinar digitalmente
              </button>
            </div>
          </>
        )}

        {/* Step 2: Signing */}
        {step === "signing" && (
          <>
            <div className="px-6 py-5 border-b border-slate-200">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-brand-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-800 text-center">
                Assinatura Digital
              </h2>
              <p className="text-sm text-slate-500 text-center mt-2">
                Confirme sua identidade para assinar os documentos com validade legal.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Certificado
                </p>
                <select
                  data-testid="signing-modal-certificate-select"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30"
                >
                  <option value="">Nenhum certificado cadastrado</option>
                  <option value="mock">Certificado A1 — Dr. Marco Silva (mock)</option>
                </select>
                <p className="text-xs text-slate-400 mt-2">
                  Cadastre seu certificado em Perfil &gt; Dados do Conselho
                </p>
              </div>

              {error && (
                <div
                  className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3"
                  data-testid="signing-modal-error"
                >
                  {error}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                data-testid="signing-modal-btn-cancel"
                className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSign}
                data-testid="signing-modal-btn-confirm"
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
              >
                Assinar e Finalizar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
