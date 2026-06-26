const express = require("express");
const {
  connectKommo,
  memedToken,
  memedPrescriptions,
  memedPrescriptionById,
  memedDeletePrescription,
  memedReceitaDigital,
  memedPrescriptionPdf,
  memedCreateProtocolo,
  memedCreateProtocoloParceiros,
  memedListProtocolos,
  memedListProtocolosParceiros,
  memedDeleteProtocolo,
  memedDeleteProtocoloParceiros,
  memedGetOpcoesReceituario,
  memedUpdateOpcoesReceituario,
  memedUploadTemplate,
  memedCidades,
  memedEspecialidades,
  memedIngredients,
} = require("../controllers/integrationsController");

const router = express.Router();

// Kommo
router.post("/kommo/connect", connectKommo);

// Memed — Token
router.get("/memed/token", memedToken);

// Memed — Prescrições
router.get("/memed/prescriptions/:doctorId", memedPrescriptions);
router.get(
  "/memed/prescriptions/:doctorId/:prescriptionId",
  memedPrescriptionById,
);
router.delete(
  "/memed/prescriptions/:doctorId/:prescriptionId",
  memedDeletePrescription,
);
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
router.get("/memed/protocolos/:doctorId", memedListProtocolos);
router.get("/memed/protocolos/parceiros", memedListProtocolosParceiros);
router.delete("/memed/protocolos/:doctorId/:protocoloId", memedDeleteProtocolo);
router.delete(
  "/memed/protocolos/parceiros/:protocoloId",
  memedDeleteProtocoloParceiros,
);

// Memed — Receituário
router.get("/memed/opcoes-receituario/:doctorId", memedGetOpcoesReceituario);
router.patch(
  "/memed/opcoes-receituario/:doctorId",
  memedUpdateOpcoesReceituario,
);
router.post(
  "/memed/opcoes-receituario/:doctorId/upload-template",
  memedUploadTemplate,
);

// Memed — Dados auxiliares
router.get("/memed/cidades", memedCidades);
router.get("/memed/especialidades", memedEspecialidades);
router.get("/memed/ingredients", memedIngredients);

module.exports = router;
