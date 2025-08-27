const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.json("name, email, password are required");
  }

  try {
    const hashedpassword = await bcrypt.hash(password, 10);

    const [existUser] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existUser > 1) {
      return res.json("Email already exist");
    }

    const [results] = await pool.query(
      "INSERT INTO users(name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedpassword, role]
    );

    res.json({ message: "Registered successfully", id: results.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json("email, password are required");
  }

  try {
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.json("User not found");
    }

    const user = users[0];

    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res.json("Invalid password");
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
