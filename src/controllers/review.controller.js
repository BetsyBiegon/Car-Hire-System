const prisma = require('../config/prisma');
const { AppError } = require('../middleware/errorHandler');

async function getVehicleReviews(req, res, next) {
  try {
    const reviews = await prisma.review.findMany({
      where: { vehicleId: req.params.vehicleId },
      include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: reviews });
  } catch (err) { next(err); }
}

async function createReview(req, res, next) {
  try {
    const { vehicleId, rating, comment, bookingId } = req.body;

    // Verify user has a completed booking for this vehicle
    const booking = await prisma.booking.findFirst({
      where: { userId: req.user.id, vehicleId, status: 'COMPLETED' },
    });
    if (!booking) return next(new AppError('You can only review vehicles you have rented.', 403));

    const review = await prisma.review.create({
      data: { userId: req.user.id, vehicleId, rating, comment, bookingId: bookingId || booking.id },
    });
    res.status(201).json({ success: true, data: review });
  } catch (err) { next(err); }
}

async function updateReview(req, res, next) {
  try {
    const review = await prisma.review.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!review) return next(new AppError('Review not found.', 404));
    const updated = await prisma.review.update({
      where: { id: review.id },
      data: { rating: req.body.rating, comment: req.body.comment },
    });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
}

async function deleteReview(req, res, next) {
  try {
    const review = await prisma.review.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!review) return next(new AppError('Review not found.', 404));
    await prisma.review.delete({ where: { id: review.id } });
    res.json({ success: true, message: 'Review deleted.' });
  } catch (err) { next(err); }
}

module.exports = { getVehicleReviews, createReview, updateReview, deleteReview };
