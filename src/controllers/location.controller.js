const prisma = require('../config/prisma');
const { AppError } = require('../middleware/errorHandler');

async function getLocations(req, res, next) {
  try {
    const locations = await prisma.location.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: locations });
  } catch (err) { next(err); }
}

async function createLocation(req, res, next) {
  try {
    const location = await prisma.location.create({ data: req.body });
    res.status(201).json({ success: true, data: location });
  } catch (err) { next(err); }
}

async function updateLocation(req, res, next) {
  try {
    const location = await prisma.location.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data: location });
  } catch (err) { next(err); }
}

async function deleteLocation(req, res, next) {
  try {
    await prisma.location.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ success: true, message: 'Location deactivated.' });
  } catch (err) { next(err); }
}

module.exports = { getLocations, createLocation, updateLocation, deleteLocation };
