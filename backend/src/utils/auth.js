import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'uniconnect-dev-secret';

export function sanitizeUser(user) {
  const source =
    typeof user.toObject === 'function' ? user.toObject() : { ...user };
  const { passwordHash, __v, ...safeUser } = source;
  return safeUser;
}

export function createToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function normalizeRole(role) {
  return String(role || '')
    .trim()
    .toLowerCase();
}
