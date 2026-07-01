# SoMed — Prontuário Eletrônico

## Identidade Visual SoMed

- **Conceito:** Precisão Cirúrgica — interface limpa, funcional, que guia o médico sem poluir sua visão.
- **Paleta:** Tailwind configurada com o prefixo `surgical` (dark, blue, teal, amber, red, slate, bg).
- **Fontes:** Inter (UI) e Lora (documentos).
- **Ícones:** Lucide React (https://lucide.dev/icons).
- **Componentes base:** `btn-primary`, `btn-secondary`, `table-surgical`, `sidebar-link`, `card-surgical`, `badge-*`.
- **Microinterações:** Transições de 150ms em cores e opacidades. Hover "fantasma" em linhas de tabela (`bg-blue-50`). Elevação de card em hover (`-translate-y-1` com `shadow-card-hover`).

## Stack

- **Frontend:** React 18, Vite, Tailwind CSS 3, React Router 7, Lucide React (ícones)
- **Backend:** Node.js, Express, PostgreSQL (`pg` raw SQL com transações)
- **Autenticação:** Nenhuma real — `doctor_id = 1` como padrão

## Módulos Implementados

### Atendimento (`/`)
- Entry Gate com seletor de paciente sugerido
- Workspace com abas: Anamnese, Orientação, Laudo, Exames, Prescrição (Memed), LGPD
- Modal de assinatura digital (2 etapas)
- Integração com Memed SDK para prescrição de controlados

### Agenda (`/agenda`)
- Calendário com react-big-calendar
- Consultas e bloqueios por médico
- Google OAuth / Google Calendar sync
- Múltiplas agendas (criação, seleção por cor, filtro)
- ModalNovaAgenda com tipo, cor e descrição

### Pacientes (`/pacientes`)
- Listagem, busca e cadastro de pacientes
- Perfil do paciente com dados demográficos

### Perfil (`/perfil/:tab`)
- Abas: Prescritor, Conselho, Contato, Clínicas, Assinaturas, Layouts
- Dados do médico prescritor

### Estoque (`/estoque`)
- **Movimentações:** Tabela de entradas/saídas, filtros (tipo, data, produto), modais Nova Entrada (com pré-etapa e fluxo "Não" → cadastro → entrada automática) e Nova Saída (com lote, paciente)
- **Produtos:** Tabela com código, embalagem, categoria, fornecedor, lote, vencimento, saldo, situação. Modal Cadastrar Produto
- **Relatórios:** Posição de Estoque (com % do ideal), Estoque Baixo/Esgotado, Produtos Próximos ao Vencimento. Submenu lateral, header com exportação CSV, modal de solicitação
- Migrations: 007 a 011

### Financeiro (`/financeiro`)
- **Receitas e Despesas:** Tabela unificada, filtros, totais com saldo
- **Contas a Pagar:** Foco em despesas, filtros
- **Contas a Receber:** Foco em receitas, filtros
- Modais de lançamento manual (Nova Despesa, Nova Receita)
- Integração automática: entrada de estoque com `registrar_financeiro=true` gera despesa; saída com `registrar_financeiro=true` gera receita
- Migration: 012

## Convenções

- Todo elemento interativo deve ter `data-testid`
- Container principal: `id="wrapper"` + classe `fuse-content`
- Tabelas semânticas com `<table>`, `<thead>`, `<tbody>`, `role="table"`, `aria-label`
- Soft delete em todas as tabelas (`deleted_at`)
- Migrations SQL incrementais em `server/migrations/`
- Ícones: Lucide React (importar de `lucide-react`)
- Cores: paleta `surgical-*` para novos componentes; `brand-*` legado ainda funcional
