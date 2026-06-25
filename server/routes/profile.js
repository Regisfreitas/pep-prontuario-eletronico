const express = require("express");
const {
  listStates,
  listSpecialties,
  showProfile,
  patchProfile,
} = require("../controllers/profileController");

const router = express.Router();

router.get("/states", listStates);
router.get("/specialties", listSpecialties);
router.get("/profile", showProfile);
router.patch("/profile", patchProfile);

module.exports = router;
