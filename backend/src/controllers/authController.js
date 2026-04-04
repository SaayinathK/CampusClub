import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { createToken, normalizeRole, sanitizeUser } from '../utils/auth.js';
import { validateCredentials } from '../utils/validateAuthInput.js';

export async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body;
    const role = normalizeRole(req.body.role);
    const validationError = validateCredentials(
      { name, email, password, role },
      true
    );

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: 'An account with this email already exists.' });
    }

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      role,
      passwordHash: await bcrypt.hash(String(password), 10)
    });

    return res.status(201).json({
      message: 'Account created successfully.',
      token: createToken(user),
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to create account right now.',
      details: error.message
    });
  }
}

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    const role = normalizeRole(req.body.role);
    const validationError = validateCredentials(
      { email, password, role },
      false
    );

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (user.role !== role) {
      return res
        .status(403)
        .json({ message: `This account is registered as a ${user.role}.` });
    }

    const isPasswordValid = await bcrypt.compare(
      String(password),
      user.passwordHash
    );

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    return res.json({
      message: 'Login successful.',
      token: createToken(user),
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to log in right now.',
      details: error.message
    });
  }
}

export function getCurrentUser(req, res) {
  return res.json({ user: sanitizeUser(req.user) });
}
