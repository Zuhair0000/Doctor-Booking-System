const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // format: "Bearer token"

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // now you can access req.user.id, req.user.role
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

function authorize(roles = []) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
