import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
}

export async function hashPassword(password) {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Password hashing failed');
  }
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
