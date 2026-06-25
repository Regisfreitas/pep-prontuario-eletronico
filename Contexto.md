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