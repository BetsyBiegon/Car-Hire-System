const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const prisma = require('../config/prisma');
const { AppError } = require('../middleware/errorHandler');

async function createCheckout(req, res, next) {
  try {
    const { bookingId } = req.params;
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId: req.user.id },
      include: { vehicle: true },
    });
    if (!booking) return next(new AppError('Booking not found.', 404));
    if (booking.status !== 'PENDING') return next(new AppError('Booking is not awaiting payment.', 400));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${booking.vehicle.make} ${booking.vehicle.model} — ${booking.totalDays} day(s)`,
          },
          unit_amount: Math.round(parseFloat(booking.totalAmount) * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/payment/cancel`,
      metadata: { bookingId },
    });

    // Create pending payment record
    await prisma.payment.upsert({
      where: { bookingId },
      create: {
        bookingId,
        amount: booking.totalAmount,
        method: 'STRIPE',
        status: 'PENDING',
        transactionId: session.id,
      },
      update: { transactionId: session.id },
    });

    res.json({ success: true, data: { url: session.url } });
  } catch (err) { next(err); }
}

async function getPayment(req, res, next) {
  try {
    const payment = await prisma.payment.findFirst({
      where: { bookingId: req.params.bookingId },
    });
    if (!payment) return next(new AppError('Payment not found.', 404));
    res.json({ success: true, data: payment });
  } catch (err) { next(err); }
}

// Stripe webhook — must use raw body (configure in app.js for this route)
async function stripeWebhook(req, res, next) {
  try {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { bookingId } = session.metadata;

      await prisma.$transaction([
        prisma.payment.update({
          where: { bookingId },
          data: { status: 'PAID', paidAt: new Date(), transactionId: session.payment_intent },
        }),
        prisma.booking.update({
          where: { id: bookingId },
          data: { status: 'CONFIRMED' },
        }),
      ]);
    }

    res.json({ received: true });
  } catch (err) { next(err); }
}

module.exports = { createCheckout, getPayment, stripeWebhook };
