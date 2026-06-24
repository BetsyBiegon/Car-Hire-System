const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../config/prisma');
const { AppError } = require('../middleware/errorHandler');

function signAccessToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
}

function signRefreshToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
}

// POST /auth/register
async function register(req, res, next) {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return next(new AppError('Email already in use.', 409));

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashed, firstName, lastName, phone },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.status(201).json({ success: true, data: { user, accessToken, refreshToken } });
  } catch (err) {
    next(err);
  }
}

// POST /auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) return next(new AppError('Invalid credentials.', 401));

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return next(new AppError('Invalid credentials.', 401));

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, data: { user: userWithoutPassword, accessToken, refreshToken } });
  } catch (err) {
    next(err);
  }
}

// POST /auth/refresh-token
async function refreshToken(req, res, next) {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return next(new AppError('Refresh token required.', 400));

    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      return next(new AppError('Invalid or expired refresh token.', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const accessToken = signAccessToken(decoded.id);

    res.json({ success: true, data: { accessToken } });
  } catch (err) {
    next(err);
  }
}

// POST /auth/logout
async function logout(req, res, next) {
  try {
    const { refreshToken: token } = req.body;
    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token } });
    }
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
}

// POST /auth/forgot-password  (stub — wire up email later)
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    // Always return 200 to avoid user enumeration
    await prisma.user.findUnique({ where: { email } });
    // TODO: generate reset token, send email
    res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
}

// POST /auth/reset-password  (stub)
async function resetPassword(req, res, next) {
  try {
    // TODO: validate reset token, update password
    res.json({ success: true, message: 'Password reset successfully.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, refreshToken, logout, forgotPassword, resetPassword };
