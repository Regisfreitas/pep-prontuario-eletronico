const express = require("express");
const {
  listTemplates,
  createDocumentHandler,
  getDocumentHandler,
  listPatientDocuments,
  signDocumentHandler,
  listCertificatesHandler,
  createCertificateHandler,
} = require("../controllers/documentController");

const router = express.Router();

// Templates
router.get("/templates", listTemplates);

// Documents
router.post("/documents", createDocumentHandler);
router.post("/documents/memed/sign", signDocumentHandler);
router.get("/documents/:id", getDocumentHandler);
router.post("/documents/:id/sign", signDocumentHandler);
router.get("/patients/:patientId/documents", listPatientDocuments);

// Certificates
router.get("/certificates/mine", listCertificatesHandler);
router.post("/certificates", createCertificateHandler);

module.exports = router;
