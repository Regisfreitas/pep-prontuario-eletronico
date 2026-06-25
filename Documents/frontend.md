# Frontend — PEP SoMed

## Stack

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **React** | ^18.3.1 | Biblioteca UI (componentes funcionais com hooks) |
| **Vite** | ^6.0.5 | Bundler e dev server (HMR) |
| **React Router DOM** | ^7.1.1 | Roteamento SPA (client-side) |
| **Tailwind CSS** | ^3.4.17 | Estilização utilitária |
| **Lucide React** | — | Biblioteca de ícones (Calendar, Stethoscope, Users, etc.) |
| **React Big Calendar** | ^1.17.1 | Calendário agenda |
| **date-fns** | ^4.1.0 | Manipulação de datas |

---

## Estrutura de Pastas

```
client/src/
├── api/                # Funções de requisição HTTP
│   ├── agenda.js       #   CRUD de eventos da agenda
│   ├── google.js       #   Conexão Google OAuth
│   └── patients.js     #   CRUD de pacientes + CRM Kommo
├── components/
│   ├── agenda/         #   Componentes da página de Agenda
│   │   ├── AgendaCalendar.jsx
│   │   ├── AgendaHeader.jsx
│   │   ├── AgendaLegend.jsx
│   │   ├── BackendOfflineBanner.jsx
│   │   ├── BloqueioModal.jsx
│   │   ├── CalendarToolbar.jsx
│   │   ├── ConsultaModal.jsx
│   │   ├── DoctorTabs.jsx
│   │   └── GoogleConnectButton.jsx
│   ├── patients/       #   Componentes da página de Pacientes
│   │   ├── CrmConnectModal.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── PatientDetailsDrawer.jsx
│   │   ├── PatientFormModal.jsx
│   │   └── PatientList.jsx
│   ├── EntryGate.jsx         # Tela inicial do atendimento
│   ├── FinalizedView.jsx     # Tela pós-finalização
│   ├── Header.jsx            # Cabeçalho do workspace de atendimento
│   ├── Layout.jsx            # Layout global (Sidebar + Outlet)
│   ├── RichTextEditor.jsx    # Editor contentEditable com formatação
│   ├── Sidebar.jsx           # Sidebar de navegação global
│   ├── SubToolbar.jsx        # Barra de ações secundárias
│   ├── Workspace.jsx         # Container do atendimento
│   └── WorkspaceSidebar.jsx  # Sidebar de módulos do atendimento
├── config/
│   └── api.js          #   API_BASE, apiUrl(), checkBackendHealth()
├── constants/
│   └── tabs.js         #   TABS (7 módulos), PATIENT, EMPTY_DRAFTS
├── context/
│   └── ToastContext.jsx #   Sistema de notificações toast
├── hooks/
│   ├── useAgenda.js        # Estado e lógica da agenda
│   ├── useAtendimento.js   # Ciclo de vida do atendimento
│   ├── useBackendHealth.js # Health check do backend
│   └── useGoogleAuth.js    # Integração Google OAuth
├── pages/
│   ├── AgendaPage.jsx      # Rota /agenda
│   ├── AtendimentoPage.jsx # Rota /
│   └── PatientsPage.jsx    # Rota /pacientes
├── styles/
│   └── agenda.css          # Customizações do React Big Calendar
├── utils/
│   └── googleSyncMessages.js # Mensagens de retorno da sincronização Google
├── App.jsx              # Rotas e providers
├── index.css            # Tailwind directives + estilos globais
└── main.jsx             # Entry point React
```

---

## Componentes Principais

### Sidebar (Navegação Global)
- **Localização:** `components/Sidebar.jsx`
- Sidebar lateral recolhível (`w-60` expandida, `w-16` colapsada)
- Ícones: `Calendar`, `Stethoscope`, `Users` (lucide-react)
- Toggle com `ChevronLeft` / `ChevronRight`
- Transição suave: `transition-all duration-300 ease-in-out`
- Links ativos destacados com `bg-medical-600 text-white`
- **data-testid:** `sidebar`, `sidebar-toggle`, `nav-link-agenda`, `nav-link-atendimento`, `nav-link-pacientes`

### Layout
- **Localização:** `components/Layout.jsx`
- Flex container `h-screen` com Sidebar + `<main id="wrapper" class="fuse-content">`
- Renderiza páginas filhas via `<Outlet />` (React Router)

### Workspace (Atendimento)
- **Localização:** `components/Workspace.jsx`
- Três fases gerenciadas por `useAtendimento`: `entry` → `workspace` → `finalized`
- Contém Header, SubToolbar, WorkspaceSidebar e RichTextEditor
- **WorkspaceSidebar** (renomeado de Sidebar.jsx original): abas internas dos módulos (Anamnese, Orientação, Laudo, etc.)

### RichTextEditor
- Editor `contentEditable` com botões de formatação (Bold, Italic, Underline)
- Placeholder via `data-placeholder` + CSS `:empty::before`
- Botão "Importar Exames"

### Agenda
- **Calendário:** `react-big-calendar` com localização `pt-BR` via `date-fns`
- **Modais:** `ConsultaModal` (agendamento) e `BloqueioModal` (bloqueio de horário)
- **Toolbar:** Navegação Hoje / Anterior / Próximo, visões Mês / Semana / Dia
- **Integração Google:** Botão `GoogleConnectButton` no `AgendaHeader`

### Pacientes
- **Listagem:** Tabela com nome e idade
- **Formulário:** `PatientFormModal` com campos: nome, nascimento, email, telefone, CPF
- **Drawer:** `PatientDetailsDrawer` (painel lateral com dados completos e status de integração)
- **CRM Kommo:** `CrmConnectModal` para configurar API Key + subdomínio

---

## Padrão de Testabilidade

Todos os elementos interativos possuem `data-testid` em kebab-case:

```jsx
<div data-testid="sidebar">
<button data-testid="sidebar-toggle">
<NavLink data-testid="nav-link-agenda">
<tr data-testid="patient-item-{id}">
<input data-testid="patient-name-input">
<button data-testid="btn-save-patient">
<input data-testid="crm-api-key-input">
<div data-testid="loading-spinner">
<aside data-testid="patient-details-overlay">
```

O contêiner principal de cada view recebe `id="wrapper"` e classe `fuse-content` para ancoragem dos testes E2E.

---

## Rotas de Navegação (Client-side)

| Path | Página | Componente |
|---|---|---|
| `/` | Atendimento | `AtendimentoPage` |
| `/agenda` | Agenda | `AgendaPage` |
| `/pacientes` | Pacientes | `PatientsPage` |
| `*` | Redirect | `Navigate` → `/agenda` |

Todas as rotas são aninhadas sob o `<Layout />`, que renderiza a Sidebar global e o `<Outlet />`.

---

## Providers

- **`ToastProvider`** — Sistema de notificações toast (inferior direito, auto-dismiss em 4.5s). Três tipos: `success`, `error`, `info`.
- **`BrowserRouter`** — React Router para navegação SPA.

---

## Configuração de Proxy (Dev)

No `vite.config.js`:

```js
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true,
  },
}
```

A função `apiUrl()` em `config/api.js` permite sobrescrever o base URL via `VITE_API_BASE_URL` (útil se o proxy não funcionar).
