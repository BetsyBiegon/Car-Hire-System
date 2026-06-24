const prisma = require('../config/prisma');

async function getDashboard(req, res, next) {
  try {
    const [totalUsers, totalVehicles, activeBookings, totalRevenue] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.vehicle.count({ where: { status: { not: 'INACTIVE' } } }),
      prisma.booking.count({ where: { status: { in: ['CONFIRMED', 'ACTIVE'] } } }),
      prisma.payment.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalVehicles,
        activeBookings,
        totalRevenue: totalRevenue._sum.amount || 0,
      },
    });
  } catch (err) { next(err); }
}

async function getRevenueReport(req, res, next) {
  try {
    const { from, to } = req.query;
    const where = { status: 'PAID' };
    if (from || to) {
      where.paidAt = {};
      if (from) where.paidAt.gte = new Date(from);
      if (to) where.paidAt.lte = new Date(to);
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        booking: {
          select: {
            startDate: true, endDate: true, totalDays: true,
            vehicle: { select: { make: true, model: true } },
          },
        },
      },
      orderBy: { paidAt: 'desc' },
    });

    const total = payments.reduce((s, p) => s + parseFloat(p.amount), 0);
    res.json({ success: true, data: { payments, total } });
  } catch (err) { next(err); }
}

async function getOccupancyReport(req, res, next) {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        _count: { select: { bookings: true } },
        bookings: {
          where: { status: { in: ['CONFIRMED', 'ACTIVE', 'COMPLETED'] } },
          select: { totalDays: true },
        },
      },
    });

    const data = vehicles.map((v) => ({
      id: v.id,
      make: v.make,
      model: v.model,
      status: v.status,
      totalBookings: v._count.bookings,
      totalDaysRented: v.bookings.reduce((s, b) => s + b.totalDays, 0),
    }));

    res.json({ success: true, data });
  } catch (err) { next(err); }
}

module.exports = { getDashboard, getRevenueReport, getOccupancyReport };
