import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import AtendimentoPage from './pages/AtendimentoPage';
import AgendaPage from './pages/AgendaPage';
import PatientsPage from './pages/PatientsPage';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AtendimentoPage />} />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/pacientes" element={<PatientsPage />} />
          <Route path="*" element={<Navigate to="/agenda" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
