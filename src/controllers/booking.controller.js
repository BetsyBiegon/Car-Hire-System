const prisma = require('../config/prisma');
const { AppError } = require('../middleware/errorHandler');

function calcDays(start, end) {
  const diff = new Date(end) - new Date(start);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

async function createBooking(req, res, next) {
  try {
    const { vehicleId, pickupLocationId, dropoffLocationId, startDate, endDate, notes } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) return next(new AppError('End date must be after start date.', 400));

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle || vehicle.status !== 'AVAILABLE') {
      return next(new AppError('Vehicle is not available.', 400));
    }

    // Check for overlapping bookings
    const overlap = await prisma.booking.findFirst({
      where: {
        vehicleId,
        status: { in: ['CONFIRMED', 'ACTIVE'] },
        AND: [{ startDate: { lte: end } }, { endDate: { gte: start } }],
      },
    });
    if (overlap) return next(new AppError('Vehicle is already booked for those dates.', 409));

    const totalDays = calcDays(start, end);
    const totalAmount = parseFloat(vehicle.pricePerDay) * totalDays;

    const booking = await prisma.booking.create({
      data: {
        userId: req.user.id,
        vehicleId,
        pickupLocationId,
        dropoffLocationId,
        startDate: start,
        endDate: end,
        totalDays,
        pricePerDay: vehicle.pricePerDay,
        totalAmount,
        notes,
        status: 'PENDING',
      },
      include: { vehicle: { select: { make: true, model: true, year: true } }, pickupLocation: true },
    });

    res.status(201).json({ success: true, data: booking });
  } catch (err) { next(err); }
}

async function getMyBookings(req, res, next) {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const where = { userId: req.user.id };
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip: (page - 1) * limit,
        take: parseInt(limit),
        include: {
          vehicle: { select: { make: true, model: true, year: true }, include: { images: { where: { isPrimary: true }, take: 1 } } },
          payment: { select: { status: true, amount: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.booking.count({ where }),
    ]);
    res.json({ success: true, data: bookings, meta: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) { next(err); }
}

async function getBookingById(req, res, next) {
  try {
    const booking = await prisma.booking.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { vehicle: true, pickupLocation: true, dropoffLocation: true, payment: true, extensions: true },
    });
    if (!booking) return next(new AppError('Booking not found.', 404));
    res.json({ success: true, data: booking });
  } catch (err) { next(err); }
}

async function cancelBooking(req, res, next) {
  try {
    const booking = await prisma.booking.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!booking) return next(new AppError('Booking not found.', 404));
    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      return next(new AppError('This booking cannot be cancelled.', 400));
    }
    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'CANCELLED' },
    });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
}

async function extendBooking(req, res, next) {
  try {
    const { newEndDate } = req.body;
    const booking = await prisma.booking.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { vehicle: true },
    });
    if (!booking) return next(new AppError('Booking not found.', 404));
    if (booking.status !== 'ACTIVE') return next(new AppError('Only active bookings can be extended.', 400));

    const newEnd = new Date(newEndDate);
    if (newEnd <= booking.endDate) return next(new AppError('New end date must be after current end date.', 400));

    const extraDays = calcDays(booking.endDate, newEnd);
    const extraAmount = parseFloat(booking.vehicle.pricePerDay) * extraDays;

    const [extension, updatedBooking] = await prisma.$transaction([
      prisma.bookingExtension.create({
        data: {
          bookingId: booking.id,
          originalEndDate: booking.endDate,
          newEndDate: newEnd,
          extraDays,
          extraAmount,
        },
      }),
      prisma.booking.update({
        where: { id: booking.id },
        data: {
          endDate: newEnd,
          totalDays: booking.totalDays + extraDays,
          totalAmount: parseFloat(booking.totalAmount) + extraAmount,
          status: 'EXTENDED',
        },
      }),
    ]);

    res.json({ success: true, data: { booking: updatedBooking, extension } });
  } catch (err) { next(err); }
}

async function getAllBookings(req, res, next) {
  try {
    const { page = 1, limit = 20, status, userId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip: (page - 1) * limit,
        take: parseInt(limit),
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          vehicle: { select: { make: true, model: true, licensePlate: true } },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.booking.count({ where }),
    ]);
    res.json({ success: true, data: bookings, meta: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) { next(err); }
}

async function updateBookingStatus(req, res, next) {
  try {
    const { status } = req.body;
    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json({ success: true, data: booking });
  } catch (err) { next(err); }
}

module.exports = { createBooking, getMyBookings, getBookingById, cancelBooking, extendBooking, getAllBookings, updateBookingStatus };
