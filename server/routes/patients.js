const express = require("express");
const {
  createPatientHandler,
  listPatientsHandler,
  getPatientHandler,
  searchPatientsHandler,
  suggestedPatientHandler,
} = require("../controllers/patientsController");

const router = express.Router();

// Static routes first (before /:id)
router.get("/search", searchPatientsHandler);
router.get("/suggested", suggestedPatientHandler);

router.post("/", createPatientHandler);
router.get("/", listPatientsHandler);
router.get("/:id", getPatientHandler);

module.exports = router;
