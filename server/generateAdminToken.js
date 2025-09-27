import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key_for_testing";

function generateToken(userId, role) {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "8h" });
}

const adminToken = generateToken(1001, 419); // userId: 1001, role: 419 (ADMIN)
console.log(`Admin token (userId: 1001, role: 419):`);
console.log(`Bearer ${adminToken}\n`);
