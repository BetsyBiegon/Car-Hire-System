const prisma = require('../config/prisma');
const { AppError } = require('../middleware/errorHandler');

async function getVehicles(req, res, next) {
  try {
    const {
      page = 1, limit = 20,
      make, model, fuelType, transmission,
      minPrice, maxPrice, locationId,
      startDate, endDate,
    } = req.query;

    const where = { status: 'AVAILABLE' };
    if (make) where.make = { contains: make, mode: 'insensitive' };
    if (model) where.model = { contains: model, mode: 'insensitive' };
    if (fuelType) where.fuelType = fuelType;
    if (transmission) where.transmission = transmission;
    if (locationId) where.locationId = locationId;
    if (minPrice || maxPrice) {
      where.pricePerDay = {};
      if (minPrice) where.pricePerDay.gte = parseFloat(minPrice);
      if (maxPrice) where.pricePerDay.lte = parseFloat(maxPrice);
    }

    // Exclude vehicles already booked for requested dates
    if (startDate && endDate) {
      where.bookings = {
        none: {
          status: { in: ['CONFIRMED', 'ACTIVE'] },
          AND: [
            { startDate: { lte: new Date(endDate) } },
            { endDate: { gte: new Date(startDate) } },
          ],
        },
      };
    }

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip: (page - 1) * limit,
        take: parseInt(limit),
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          location: { select: { name: true, city: true } },
          reviews: { select: { rating: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.vehicle.count({ where }),
    ]);

    // Attach average rating
    const data = vehicles.map((v) => ({
      ...v,
      avgRating: v.reviews.length
        ? (v.reviews.reduce((s, r) => s + r.rating, 0) / v.reviews.length).toFixed(1)
        : null,
      reviewCount: v.reviews.length,
      reviews: undefined,
    }));

    res.json({ success: true, data, meta: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) { next(err); }
}

async function getVehicleById(req, res, next) {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: req.params.id },
      include: {
        images: true,
        location: true,
        reviews: {
          include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
    if (!vehicle) return next(new AppError('Vehicle not found.', 404));
    res.json({ success: true, data: vehicle });
  } catch (err) { next(err); }
}

async function createVehicle(req, res, next) {
  try {
    const vehicle = await prisma.vehicle.create({ data: req.body });
    res.status(201).json({ success: true, data: vehicle });
  } catch (err) { next(err); }
}

async function updateVehicle(req, res, next) {
  try {
    const vehicle = await prisma.vehicle.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: vehicle });
  } catch (err) { next(err); }
}

async function deleteVehicle(req, res, next) {
  try {
    await prisma.vehicle.update({ where: { id: req.params.id }, data: { status: 'INACTIVE' } });
    res.json({ success: true, message: 'Vehicle deactivated.' });
  } catch (err) { next(err); }
}

async function updateVehicleStatus(req, res, next) {
  try {
    const { status } = req.body;
    const vehicle = await prisma.vehicle.update({
      where: { id: req.params.id },
      data: { status },
      select: { id: true, status: true },
    });
    res.json({ success: true, data: vehicle });
  } catch (err) { next(err); }
}

module.exports = { getVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle, updateVehicleStatus };
