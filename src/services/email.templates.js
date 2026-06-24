function bookingConfirmation({ firstName, bookingId, vehicle, startDate, endDate, totalDays, totalAmount, pickupLocation }) {
  return {
    subject: 'Booking Confirmed — Car Hire',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #2563eb;">Booking Confirmed</h2>
        <p>Hi ${firstName},</p>
        <p>Your booking has been confirmed. Here are the details:</p>
        <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Booking ID</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${bookingId}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Vehicle</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${vehicle}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Pickup Location</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${pickupLocation}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Start Date</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${new Date(startDate).toDateString()}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>End Date</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${new Date(endDate).toDateString()}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Total Days</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${totalDays}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Total Amount</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">$${totalAmount}</td></tr>
        </table>
        <p>Thank you for choosing Car Hire. Have a great trip!</p>
      </div>
    `,
  };
}

function bookingCancellation({ firstName, bookingId, vehicle, startDate }) {
  return {
    subject: 'Booking Cancelled — Car Hire',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #dc2626;">Booking Cancelled</h2>
        <p>Hi ${firstName},</p>
        <p>Your booking has been cancelled.</p>
        <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Booking ID</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${bookingId}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Vehicle</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${vehicle}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Start Date</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${new Date(startDate).toDateString()}</td></tr>
        </table>
        <p>If this was a mistake, please contact us or make a new booking.</p>
      </div>
    `,
  };
}

function paymentReceipt({ firstName, bookingId, vehicle, amount, paidAt, transactionId }) {
  return {
    subject: 'Payment Receipt — Car Hire',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #16a34a;">Payment Received</h2>
        <p>Hi ${firstName},</p>
        <p>We've received your payment. Here's your receipt:</p>
        <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Booking ID</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${bookingId}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Vehicle</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${vehicle}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Amount Paid</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">$${amount}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Date</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${new Date(paidAt).toDateString()}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Transaction ID</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${transactionId}</td></tr>
        </table>
        <p>Thank you for your payment!</p>
      </div>
    `,
  };
}

function bookingReminder({ firstName, bookingId, vehicle, startDate, pickupLocation }) {
  return {
    subject: 'Reminder: Your rental starts tomorrow — Car Hire',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #d97706;">Rental Reminder</h2>
        <p>Hi ${firstName},</p>
        <p>Just a reminder that your rental starts <strong>tomorrow</strong>.</p>
        <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Booking ID</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${bookingId}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Vehicle</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${vehicle}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Pickup Location</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${pickupLocation}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Start Date</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${new Date(startDate).toDateString()}</td></tr>
        </table>
        <p>Please ensure you have your driver's license and booking ID ready.</p>
      </div>
    `,
  };
}

module.exports = { bookingConfirmation, bookingCancellation, paymentReceipt, bookingReminder };
