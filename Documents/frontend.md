# Frontend — PEP SoMed

## Stack

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **React** | ^18.3.1 | Biblioteca UI (componentes funcionais com hooks) |
| **Vite** | ^6.0.5 | Bundler e dev server (HMR) |
| **React Router DOM** | ^7.1.1 | Roteamento SPA (client-side) |
| **Tailwind CSS** | ^3.4.17 | Estilização utilitária |
| **Lucide React** | — | Biblioteca de ícones (Calendar, Stethoscope, Users, Building2, CreditCard, FileText, UserRound, etc.) |
| **React Big Calendar** | ^1.17.1 | Calendário agenda |
| **date-fns** | ^4.1.0 | Manipulação de datas |

---

## Estrutura de Pastas

```
client/src/
├── api/                # Funções de requisição HTTP
│   ├── agenda.js       #   CRUD de eventos da agenda
│   ├── google.js       #   Conexão Google OAuth
│   ├── memed.js        #   Token e script URL da Memed
│   └── patients.js     #   CRUD de pacientes, busca e sugestão
├── components/
│   ├── agenda/         #   Componentes da página de Agenda
│   │   ├── AgendaCalendar.jsx
│   │   ├── AgendaHeader.jsx
│   │   ├── AgendaLegend.jsx
│   │   ├── BackendOfflineBanner.jsx
│   │   ├── BloqueioModal.jsx
│   │   ├── CalendarToolbar.jsx
│   │   ├── ConsultaModal.jsx
│   │   ├── DoctorTabs.jsx          # Apenas médico logado (bg-medical-600)
│   │   └── GoogleConnectButton.jsx
│   ├── patients/       #   Componentes da página de Pacientes
│   │   ├── CrmConnectModal.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── PatientDetailsDrawer.jsx
│   │   ├── PatientFormModal.jsx
│   │   └── PatientList.jsx
│   ├── profile/        #   Componentes do Perfil
│   │   └── ProfileModal.jsx        # Modal de perfil (reservado para Memed)
│   ├── EntryGate.jsx         # Tela inicial com seletor inteligente de pacientes
│   ├── FinalizedView.jsx     # Tela pós-finalização
│   ├── Header.jsx            # Cabeçalho do workspace de atendimento
│   ├── Layout.jsx            # Layout global (Sidebar + Outlet)
│   ├── MemedPrescription.jsx # Integração Memed (reservado)
│   ├── RichTextEditor.jsx    # Editor contentEditable com formatação
│   ├── Sidebar.jsx           # Sidebar de navegação global com accordion Perfil
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
│   ├── PatientsPage.jsx    # Rota /pacientes
│   └── PerfilPage.jsx      # Rota /perfil (com tabs e placeholders)
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
- **Accordion Perfil:** ao clicar, expande 4 submenus com ícones:
  - `Dados do Prescritor` (`UserRound`) → `/perfil/prescritor`
  - `Minhas Clínicas` (`Building2`) → `/perfil/clinicas`
  - `Planos e Assinaturas` (`CreditCard`) → `/perfil/assinaturas`
  - `Meus Layouts` (`FileText`) → `/perfil/layouts`
- ChevronDown com rotação `rotate-180` ao abrir
- Auto-open se a URL atual começa com `/perfil`
- Links ativos destacados com `bg-medical-600 text-white`
- **data-testid:** `sidebar`, `sidebar-toggle`, `nav-link-agenda`, `nav-link-atendimento`, `nav-link-pacientes`, `nav-link-perfil`

### Layout
- **Localização:** `components/Layout.jsx`
- Flex container `h-screen` com Sidebar + `<main id="wrapper" class="fuse-content">`
- Renderiza páginas filhas via `<Outlet />` (React Router)

### Workspace (Atendimento)
- **Localização:** `components/Workspace.jsx`
- Três fases gerenciadas por `useAtendimento`: `entry` → `workspace` → `finalized`
- Contém Header, SubToolbar, WorkspaceSidebar e RichTextEditor
- **WorkspaceSidebar:** abas internas dos módulos (Anamnese, Orientação, Laudo, etc.)

### EntryGate (Seletor Inteligente de Pacientes)
- **Localização:** `components/EntryGate.jsx`
- Combobox customizado (sem bibliotecas externas) com Tailwind
- **Sugestão automática:** busca o paciente sugerido via `GET /patients/suggested` ao montar
- **Busca com debounce:** 300ms após digitar 2+ caracteres
- **Resultados:** avatar com iniciais, nome, idade, PAC-ID
- Botão "Atender {nome}" dinâmico com o paciente selecionado
- **data-testid:** `patient-selector-input`, `patient-option-{id}`, `btn-start-atendimento`

### RichTextEditor
- Editor `contentEditable` com botões de formatação (Bold, Italic, Underline)
- Placeholder via `data-placeholder` + CSS `:empty::before`
- Botão "Importar Exames"

### Agenda
- **Calendário:** `react-big-calendar` com localização `pt-BR` via `date-fns`
- **Header:** apenas o título "Agenda" + busca + botões de ação (breadcrumbs e badge removidos)
- **DoctorTabs:** exibe apenas o médico logado com `bg-medical-600` (cor dourada removida)
- **Toolbar:** botão "Hoje" funcional com `data-testid="btn-today"`, navegação e visões Mês/Semana/Dia
- **Modais:** `ConsultaModal` (agendamento) e `BloqueioModal` (bloqueio de horário)
- **Integração Google:** Botão `GoogleConnectButton` no `AgendaHeader`

### PerfilPage
- **Localização:** `pages/PerfilPage.jsx`
- Página com tabs inline: Prescritor | Conselho | Contato
- Formulário com validação de CPF, data de nascimento e conselho (exigência Memed)
- Máscaras de CPF e telefone no frontend
- Placeholders para os demais submenus (Clínicas, Assinaturas, Layouts) com badge "Em breve"

### Pacientes
- **Listagem:** Tabela com nome e idade, `data-testid="patient-item-{id}"`
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
<button data-testid="nav-link-perfil">
<button data-testid="submenu-dados-prescritor">
<button data-testid="submenu-minhas-clinicas">
<button data-testid="submenu-planos-assinaturas">
<button data-testid="submenu-meus-layouts">
<input data-testid="patient-selector-input">
<button data-testid="patient-option-{id}">
<button data-testid="btn-start-atendimento">
<button data-testid="btn-today">
<tr data-testid="patient-item-{id}">
<input data-testid="patient-name-input">
<button data-testid="btn-save-patient">
<input data-testid="crm-api-key-input">
<div data-testid="loading-spinner">
<aside data-testid="patient-details-overlay">
<div data-testid="profile-modal">
<button data-testid="tab-prescritor">
<div data-testid="memed-loading">
```

O contêiner principal de cada view recebe `id="wrapper"` e classe `fuse-content` para ancoragem dos testes E2E.

---

## Rotas de Navegação (Client-side)

| Path | Página | Componente |
|---|---|---|
| `/` | Atendimento | `AtendimentoPage` |
| `/agenda` | Agenda | `AgendaPage` |
| `/pacientes` | Pacientes | `PatientsPage` |
| `/perfil` | Perfil (redirect → /perfil/prescritor) | `PerfilPage` |
| `/perfil/:tab` | Perfil (prescritor, conselho, contato, clinicas, assinaturas, layouts) | `PerfilPage` |
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
