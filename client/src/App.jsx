import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import Layout from "./components/Layout";
import AtendimentoPage from "./pages/AtendimentoPage";
import AgendaPage from "./pages/AgendaPage";
import PatientsPage from "./pages/PatientsPage";
import PerfilPage from "./pages/PerfilPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import MovimentacoesEstoque from "./pages/MovimentacoesEstoque";

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<AtendimentoPage />} />
            <Route path="/agenda" element={<AgendaPage />} />
            <Route path="/pacientes" element={<PatientsPage />} />
            <Route path="/perfil" element={<PerfilPage />} />
            <Route path="/perfil/:tab" element={<PerfilPage />} />
            <Route path="/estoque">
              <Route path="movimentacoes" element={<MovimentacoesEstoque />} />
              <Route path="produtos" element={<PlaceholderPage />} />
              <Route path="relatorios" element={<PlaceholderPage />} />
            </Route>
            <Route path="/financeiro">
              <Route path="receitas-despesas" element={<PlaceholderPage />} />
              <Route path="contas-pagar" element={<PlaceholderPage />} />
              <Route path="contas-receber" element={<PlaceholderPage />} />
              <Route path="orcamentos" element={<PlaceholderPage />} />
              <Route path="gerar-recibo-nfe" element={<PlaceholderPage />} />
              <Route path="relatorios" element={<PlaceholderPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/agenda" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
