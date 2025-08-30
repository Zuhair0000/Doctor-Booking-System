const pool = require("../db");

exports.createBooking = async (req, res) => {
  const { doctor_id, availability_id } = req.body;
  const patient_id = req.user.id;

  try {
    const [existBooking] = await pool.query(
      "SELECT * FROM bookings WHERE doctor_id = ? AND availability_id = ?",
      [doctor_id, availability_id]
    );

    if (existBooking.length > 0) {
      return res.status(400).json({ error: "This slot is already booked" });
    }

    const [results] = await pool.query(
      "INSERT INTO bookings(patient_id, doctor_id, availability_id, status) VALUES (?, ?, ?, 'pending')",
      [patient_id, doctor_id, availability_id]
    );

    res.json({ message: "Booked successfully", bookingId: results.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getPatientBookings = async (req, res) => {
  const patient_id = req.user.id;

  try {
    const [bookings] = await pool.query(
      `
      SELECT b.id AS booking_id, b.status, b.created_at, 
      d.id AS doctor_id, u.name AS doctor_name, 
      a.start_time, a.end_time
      FROM bookings b
      JOIN doctors d ON b.doctor_id = d.id
      JOIN availability a ON b.availability_id = a.id
      JOIN users u ON d.user_id = u.id
      WHERE b.patient_id = ?
      ORDER BY a.start_time DESC
      `,
      [patient_id]
    );

    if (bookings.length === 0) {
      return res.status(400).json({ error: "No bookings found" });
    }

    res.json({ message: "Fetched bookings successfully", bookings });
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};

exports.getDoctorBookings = async (req, res) => {
  const user_id = req.user.id;

  try {
    const [doctorRows] = await pool.query(
      "SELECT id FROM doctors WHERE user_id = ?",
      [user_id]
    );
    if (doctorRows.length === 0)
      return res.status(404).json({ error: "Doctor profile not found" });

    const doctor_id = doctorRows[0].id;

    const [bookings] = await pool.query(
      `
      SELECT b.id AS booking_id, b.status, b.created_at, 
      u.id AS patient_id, u.name AS patient_name, 
      a.start_time, a.end_time
      FROM bookings b
      JOIN availability a ON b.availability_id = a.id
      JOIN users u ON b.patient_id = u.id 
      WHERE b.doctor_id = ?
      ORDER BY a.start_time DESC
      `,
      [doctor_id]
    );

    if (bookings.length === 0) {
      return res.status(400).json({ error: "No bookings found" });
    }

    res.json({ message: "Fetched bookings successfully", bookings });
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};
