const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { AppError } = require('../middleware/errorHandler');

async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, avatarUrl: true, createdAt: true },
    });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

async function updateMe(req, res, next) {
  try {
    const { firstName, lastName, phone, password, licenseNumber } = req.body;
    const data = {};
    if (firstName) data.firstName = firstName;
    if (lastName) data.lastName = lastName;
    if (phone) data.phone = phone;
    if (licenseNumber) data.licenseNumber = licenseNumber;
    if (password) data.password = await bcrypt.hash(password, 12);

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: { id: true, email: true, firstName: true, lastName: true, phone: true },
    });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

async function deleteMe(req, res, next) {
  try {
    await prisma.user.update({ where: { id: req.user.id }, data: { isActive: false } });
    res.json({ success: true, message: 'Account deactivated.' });
  } catch (err) { next(err); }
}

async function getAllUsers(req, res, next) {
  try {
    const { page = 1, limit = 20, role } = req.query;
    const where = role ? { role } : {};
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: parseInt(limit),
        select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);
    res.json({ success: true, data: users, meta: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) { next(err); }
}

async function getUserById(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, phone: true, createdAt: true },
    });
    if (!user) return next(new AppError('User not found.', 404));
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

async function toggleUserStatus(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return next(new AppError('User not found.', 404));
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: !user.isActive },
      select: { id: true, isActive: true },
    });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
}

module.exports = { getMe, updateMe, deleteMe, getAllUsers, getUserById, toggleUserStatus };
