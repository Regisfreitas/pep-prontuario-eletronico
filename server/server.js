const path = require("path");

try {
  require("dotenv").config({ path: path.join(__dirname, "../.env") });
} catch (err) {
  if (err.code === "MODULE_NOT_FOUND") {
    console.error("\n Dependencias do back-end nao instaladas.");
    console.error(" Execute na raiz do projeto:\n");
    console.error("   cd C:\\Users\\Windows\\Projects\\pep-emr");
    console.error("   npm install\n");
    process.exit(1);
  }
  throw err;
}

const express = require("express");
const cors = require("cors");
const { initDb } = require("./db");
const atendimentoRoutes = require("./routes/atendimento");
const agendaRoutes = require("./routes/agenda");
const googleRoutes = require("./routes/google");
const patientsRoutes = require("./routes/patients");
const integrationsRoutes = require("./routes/integrations");
const profileRoutes = require("./routes/profile");
const documentRoutes = require("./routes/documents");
const { seedDemoData } = require("./controllers/agendaController");
const { seedDoctors } = require("./services/doctorService");
const { seedPatients } = require("./services/patientService");
const {
  seedPromptAI,
  seedCIDReference,
} = require("./services/aiScribeSeedService");
const { seedDocumentTemplates } = require("./services/documentSeedService");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "pep-emr-api",
    port: PORT,
    database: "postgresql",
  });
});

app.use("/api/google", googleRoutes);
app.use("/api/agenda", agendaRoutes);
app.use("/api/patients", patientsRoutes);
app.use("/api/integrations", integrationsRoutes);
app.use("/api", profileRoutes);
app.use("/api", documentRoutes);
app.use("/api", atendimentoRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}

async function start() {
  await initDb();
  await seedDoctors();
  await seedPatients();
  await seedDemoData();
  await seedPromptAI();
  await seedCIDReference();
  await seedDocumentTemplates();

  app.listen(PORT, () => {
    console.log(`PEP EMR server running on http://localhost:${PORT}`);
    if (!process.env.DATABASE_URL) {
      console.warn("⚠ DATABASE_URL não definida");
    }
    if (!process.env.GOOGLE_CLIENT_ID) {
      console.warn(
        "⚠ Google OAuth: copie .env.example → .env e preencha GOOGLE_CLIENT_ID/SECRET",
      );
    } else {
      console.log(
        `Google OAuth callback: ${process.env.GOOGLE_REDIRECT_URI || "não definido"}`,
      );
    }
    if (!process.env.MEMED_API_KEY) {
      console.warn("⚠ Memed Prescrição: MEMED_API_KEY não configurada");
    } else {
      // Validar chaves na inicialização
      const memedService = require("./services/memedService");
      try {
        const check = await memedService.checkKeyPair();
        console.log(`Memed: chaves válidas${check?.data ? " ✅" : " ✅"}`);
      } catch (err) {
        console.warn(`⚠ Memed: chaves inválidas ou API offline — ${err.message}`);
        console.warn("   Verifique MEMED_API_KEY e MEMED_SECRET_KEY no .env");
      }
    }
  });
}

start().catch((err) => {
  console.error("Falha ao iniciar servidor:", err.message);
  process.exit(1);
});
