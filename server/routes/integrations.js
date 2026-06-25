const express = require("express");
const {
  connectKommo,
  memedToken,
  memedPrescriptions,
  memedReceitaDigital,
  memedPrescriptionPdf,
  memedCreateProtocolo,
  memedCreateProtocoloParceiros,
  memedUpdateOpcoesReceituario,
  memedUploadTemplate,
  memedCidades,
  memedEspecialidades,
} = require("../controllers/integrationsController");

const router = express.Router();

// Kommo
router.post("/kommo/connect", connectKommo);

// Memed — Token
router.get("/memed/token", memedToken);

// Memed — Prescrições
router.get("/memed/prescriptions/:doctorId", memedPrescriptions);
router.get(
  "/memed/prescriptions/:doctorId/:prescriptionId/receita",
  memedReceitaDigital,
);
router.get(
  "/memed/prescriptions/:doctorId/:prescriptionId/pdf",
  memedPrescriptionPdf,
);

// Memed — Protocolos
router.post("/memed/protocolos", memedCreateProtocolo);
router.post("/memed/protocolos/parceiros", memedCreateProtocoloParceiros);

// Memed — Receituário
router.patch(
  "/memed/opcoes-receituario/:doctorId",
  memedUpdateOpcoesReceituario,
);
router.post(
  "/memed/opcoes-receituario/:doctorId/upload-template",
  memedUploadTemplate,
);

// Memed — Dados auxiliares (cache)
router.get("/memed/cidades", memedCidades);
router.get("/memed/especialidades", memedEspecialidades);

module.exports = router;
