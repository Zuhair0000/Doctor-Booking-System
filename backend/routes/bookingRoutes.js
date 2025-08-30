const express = require("express");
const {
  createBooking,
  getPatientBookings,
  getDoctorBookings,
} = require("../controllers/bookingController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", authenticate, authorize(["patient"]), createBooking);
router.get(
  "/patient",
  authenticate,
  authorize(["patient"]),
  getPatientBookings
);
router.get("/doctor", authenticate, authorize(["doctor"]), getDoctorBookings);

module.exports = router;
