const express = require("express");
const {
  createBooking,
  getPatientBookings,
  getDoctorBookings,
  updateBookingStatus,
} = require("../controllers/bookingController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", authenticate, authorize(["patient"]), createBooking);
router.put(
  "/:booking_id/status",
  authenticate,
  authorize(["doctor"]),
  updateBookingStatus
);
router.get(
  "/patient",
  authenticate,
  authorize(["patient"]),
  getPatientBookings
);
router.get("/doctor", authenticate, authorize(["doctor"]), getDoctorBookings);

module.exports = router;
