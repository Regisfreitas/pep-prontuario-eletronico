import { useState } from "react";
import SubmenuRelatorios from "../components/SubmenuRelatorios";
import HeaderRelatorios from "../components/HeaderRelatorios";
import RelatorioPosicao from "../components/RelatorioPosicao";
import RelatorioBaixo from "../components/RelatorioBaixo";
import RelatorioVencimento from "../components/RelatorioVencimento";
import ModalSolicitarRelatorio from "../components/ModalSolicitarRelatorio";

const TITULOS = {
  posicao: "Posição de Estoque",
  baixo: "Estoque Baixo / Esgotado",
  vencimento: "Produtos Próximos ao Vencimento",
};

export default function RelatoriosEstoque() {
  const [activeReport, setActiveReport] = useState("posicao");
  const [modalSolicitarAberto, setModalSolicitarAberto] = useState(false);

  const exportRefs = {};

  const setExportFn = (key, fn) => { exportRefs[key] = fn; };

  return (
    <div
      id="wrapper"
      className="flex flex-1 bg-slate-50"
      data-testid="page-estoque-relatorios"
    >
      <SubmenuRelatorios activeReport={activeReport} onChange={setActiveReport} />

      <div className="flex-1 flex flex-col">
        <HeaderRelatorios
          titulo={TITULOS[activeReport]}
          onExportarTabela={() => {
            // Each report component exposes handleExport via its own button
            // For the header button, we'll trigger a CSV download of current view
            // The reports already have export buttons internally, so this is a convenience
            const table = document.querySelector('[data-testid="tabela-relatorio"]');
            if (!table) return;
            const rows = Array.from(table.querySelectorAll("tbody tr"));
            const headers = Array.from(table.querySelectorAll("thead th")).map((th) => th.textContent.replace(/[▲▼]/g, "").trim());
            const csvRows = rows.map((tr) =>
              Array.from(tr.querySelectorAll("td")).map((td) => `"${td.textContent.trim().replace(/"/g, '""')}"`).join(",")
            );
            const blob = new Blob(["\uFEFF" + headers.join(",") + "\n" + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `relatorio-${activeReport}-${new Date().toISOString().split("T")[0]}.csv`;
            link.click();
            URL.revokeObjectURL(link.href);
          }}
          onSolicitarRelatorio={() => setModalSolicitarAberto(true)}
        />

        {activeReport === "posicao" && <RelatorioPosicao />}
        {activeReport === "baixo" && <RelatorioBaixo />}
        {activeReport === "vencimento" && <RelatorioVencimento />}
      </div>

      <ModalSolicitarRelatorio
        isOpen={modalSolicitarAberto}
        onClose={() => setModalSolicitarAberto(false)}
      />
    </div>
  );
}
