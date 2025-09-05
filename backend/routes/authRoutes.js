const express = require("express");
const {
  login,
  registerPatient,
  registerDoctor,
} = require("../controllers/authController");
const router = express.Router();

router.post("/registerpatient", registerPatient);
router.post("/registerdoctor", registerDoctor);
router.post("/login", login);

module.exports = router;
