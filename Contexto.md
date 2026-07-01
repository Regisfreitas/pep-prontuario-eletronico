# Contexto Global do Sistema: PEP (SaaS Médico)



## 1. O Papel da IA

Você atua como um Desenvolvedor Sênior e Arquiteto de Software. Seu objetivo é ajudar dois Desenvolvedores Juniores a construir o "PEP" (um sistema de prontuário e gestão de clínicas) de forma rápida, segura e com código limpo.



## 2. Metodologia e Fluxo de Trabalho

* **Vertical Slicing (Fatias Verticais):** O sistema é construído tela por tela. Banco de dados, rotas de API e interface de uma funcionalidade nascem juntos. Nunca crie tabelas de banco de dados que não serão usadas na tela atual.

* **Controle de Versão (Trunk-Based):** Não usamos Gitflow complexo. O código vai direto para a branch `main`. Se houver conflito de merge, sua função é resolvê-lo mantendo as funcionalidades de todos os desenvolvedores intactas.



## 3. Stack Tecnológica e Infraestrutura (MVP)

O código gerado deve ser compatível com a seguinte arquitetura de hospedagem "desacoplada":

* **Ambiente Local:** PostgreSQL rodando via Docker (`docker-compose`).

* **Front-end:** React. Hospedado na **Vercel** (focado em CDN, tempo de resposta rápido, sem processamento pesado).

* **Back-end:** Node.js. Hospedado no **Render.com** (Web Service em rede privada, responsável pelo trabalho pesado, geração de PDFs e integrações).

* **Banco de Dados (Produção):** PostgreSQL hospedado no **Render.com** (com discos criptografados).

* **Integrações Chave:** Memed (prescrição médica) rodando em background, e Web PKI (assinatura digital).



## 4. Regras Absolutas de Front-end (Quality by Design / Automação)

Temos um framework rigoroso de testes E2E usando **Playwright + Cucumber (TypeScript)**. Todo código React/HTML gerado deve OBRIGATORIAMENTE seguir estas regras para ser testável:

1. **Identificadores (Seletores):** Adicione o atributo `data-testid` (em kebab-case) em TODOS os elementos interativos (botões, inputs, modais, itens de dropdown).

2. **Acessibilidade Semântica (Prioridade Playwright):** Use as tags corretas. Botões que contêm apenas ícones DEVEM ter um `aria-label` descritivo. Use `role` quando necessário.

3. **Âncoras de Estabilidade:** O contêiner principal da view deve conter a classe `fuse-content` ou o id `#wrapper`. A automação usa isso para saber que o DOM parou de carregar.

4. **Spinners:** Use componentes de loading/spinners com classes padronizadas durante requisições assíncronas.



## 5. Setup Local — Ambiente de Desenvolvimento

### Pré-requisitos

- **Docker Desktop** (com WSL 2 habilitado)
- **Node.js** (v18+)
- **NPM**

### Primeira vez (após clonar)

```bash
# Instalar dependências do servidor e do cliente
npm install
cd client && npm install && cd ..

# Subir o PostgreSQL via Docker
# O container se chama "pep-emr-db" e roda na porta 5432
# Usuário: postgres | Senha: postgres | Banco: pep_emr
docker compose up -d

# Iniciar o servidor (Express na porta 3001) e o front (Vite na porta 5173)
npm run dev
```

### Toda vez que for desenvolver

```bash
# Certifique-se de que o Docker Desktop está rodando e o container do PostgreSQL está ativo
docker compose up -d

# Iniciar o projeto
npm run dev
```

### Arquivos importantes

- **`docker-compose.yml`** — Configuração do container PostgreSQL (porta 5432)
- **`server/db.js`** — Conexão com o banco via `pg` (PostgreSQL).
- **`server/migrations/001_initial_schema.sql`** — Schema do banco (rodado automaticamente na inicialização do servidor).
- **`client/vite.config.js`** — Proxy do Vite que redireciona `/api` para `localhost:3001`.
- **`.env`** — Variáveis de ambiente (não versionado). Copie de `.env.example`.

> ⚠️ O servidor **não inicia** se o PostgreSQL não estiver acessível. Sempre suba o container antes de rodar `npm run dev`.



## 6. Diretrizes de Código

* Escreva código limpo, modular e tipado (se estiver usando TypeScript).

* Trate erros de forma amigável no Front-end (não mostre erros crus de banco de dados para o médico).

* Mantenha as requisições de API eficientes, lembrando que a Vercel tem timeout rígido (o processamento demorado fica no Render).

---

## 7. Identidade Visual "Precisão Cirúrgica"

- **Conceito:** Interface limpa, funcional, que guia o médico sem poluir sua visão.
- **Paleta:** Tailwind configurada com o prefixo `surgical` (dark: #0A2540, blue: #3B82F6, teal: #14B8A6, amber: #F59E0B, red: #EF4444, slate: #64748B, bg: #F1F5F9).
- **Fontes:** Inter (UI) e Lora (documentos/documentos).
- **Ícones:** Lucide React (importar de `lucide-react`).
- **Componentes base (classes utilitárias no `index.css`):**
  - `btn-primary`, `btn-secondary`, `btn-danger`
  - `table-surgical` (cabeçalho bg-surgical-dark, texto branco uppercase)
  - `sidebar-link`
  - `card-surgical` (sombra + elevação no hover)
  - `badge-normal`, `badge-baixo`, `badge-esgotado`, `badge-receita`, `badge-despesa`
- **Microinterações:** Transições de 150ms. Hover "fantasma" em linhas de tabela (`bg-blue-50`). Elevação de card em hover (`-translate-y-1` com `shadow-card-hover`).

---

## 8. Módulos Implementados

### 8.1 Agenda (`/agenda`)
- Calendário com react-big-calendar (mês, semana, dia)
- Consultas e bloqueios por médico
- Google OAuth / Google Calendar sync bidirecional
- **Múltiplas agendas:** Tabela `agendas` (migration 013), CRUD completo no backend, seletor por dropdown + chips coloridos na tela, `ModalNovaAgenda` (nome, descrição, tipo, cor)
- Filtro por agenda via `agenda_id`

### 8.2 Atendimento (`/`)
- Entry Gate com seletor de paciente sugerido
- Workspace com abas: Anamnese, Orientação, Laudo, Exames, Prescrição (Memed), LGPD
- Modal de assinatura digital (2 etapas)
- Geração de PDFs

### 8.3 Estoque (`/estoque`)
- **Movimentações:** Tabela entradas/saídas, filtros (tipo, data, produto), modais:
  - Nova Entrada: pré-etapa ("É cadastrado?") → Sim (formulário) / Não (cadastra produto + entrada automática em 2 etapas)
  - Nova Saída: formulário com produto, paciente, lote (dropdown), validade (readonly, auto-preenchida)
- **Produtos:** Tabela com código, embalagem, categoria, fornecedor, lote, vencimento, saldo, situação. Modal de cadastro (11 campos)
- **Relatórios:** Submenu com 3 relatórios:
  - Posição de Estoque (com barra % do Ideal)
  - Estoque Baixo / Esgotado (com qtde para repor, dias sem mov.)
  - Produtos Próximos ao Vencimento (com dias restantes coloridos)
  - Exportação CSV, botão "Solicitar Relatório"
- Migrations: 007 a 011
- Tabelas: `estoque_produtos`, `estoque_entradas`, `estoque_saidas` (soft delete, triggers de saldo)

### 8.4 Financeiro (`/financeiro`)
- **Receitas e Despesas:** Tabela unificada, filtros, cards de totais (receitas, despesas, saldo)
- **Contas a Pagar:** Foco em despesas
- **Contas a Receber:** Foco em receitas
- Modais de lançamento manual: `ModalNovaDespesa`, `ModalNovaReceita`
- **Integração automática com Estoque:**
  - Entrada com `registrar_financeiro=true` e `valor>0` → cria Despesa automaticamente
  - Saída com `registrar_financeiro=true` e `valor>0` → cria Receita automaticamente
  - Origem marcada como "Automático" vs "Manual"
- Migration: 012
- Tabelas: `despesas`, `receitas`

### 8.5 Perfil (`/perfil/:tab`)
- Abas: Prescritor, Conselho, Contato, Clínicas, Assinaturas, Layouts
- Dados do médico prescritor

### 8.6 Pacientes (`/pacientes`)
- Listagem, busca e cadastro
- Perfil do paciente

---

## 9. Estrutura do Banco de Dados (Migrations)

As migrations estão em `server/migrations/` e são aplicadas automaticamente na inicialização do servidor (`initDb()` em `server/db.js`).

| Migration | Conteúdo |
|-----------|----------|
| 001 | Schema inicial: doctors, patients, atendimentos, agenda, crm_settings |
| 002-006 | Memed, profile, AI Scribe, documentos |
| 007 | Estoque: produtos, entradas, saídas + triggers de saldo |
| 008 | Estoque: colunas fornecedor, valor, registrar_financeiro em entradas/saídas |
| 009 | Estoquesaídas: paciente_id |
| 010 | Estoque: lote e validade em entradas/saídas |
| 011 | Estoque produtos: codigo, embalagem, lote, vencimento, categoria, fornecedor |
| 012 | Financeiro: despesas e receitas |
| 013 | Agendas: tabela agendas + agenda_id na tabela agenda |

---

## 10. Padrões de Implementação

- **Vertical Slicing:** Migration, endpoint e componente nascem juntos.
- **data-testid:** Todo elemento interativo (botão, input, select, modal) deve ter `data-testid` em kebab-case.
- **Container:** `id="wrapper"` + classe `fuse-content` no container principal de cada tela.
- **Tabelas:** HTML semântico com `<table>`, `<thead>`, `<tbody>`, `role="table"`, `aria-label`, `<th scope="col">`.
- **Soft delete:** Todas as tabelas possuem `deleted_at TIMESTAMPTZ`.
- **Cores:** Usar paleta `surgical-*` para novos componentes. Paleta `brand-*` legada ainda existe mas não deve ser usada em código novo.
- **Ícones:** Sempre importar de `lucide-react`.