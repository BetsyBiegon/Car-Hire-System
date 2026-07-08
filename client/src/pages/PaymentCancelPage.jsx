import { Link } from 'react-router-dom';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md p-10 text-center max-w-md w-full">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Cancelled</h2>
        <p className="text-gray-500 mb-6">Your payment was not completed. Your booking is still pending.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/bookings" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
            My Bookings
          </Link>
          <Link to="/" className="border border-gray-300 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-50 transition">
            Browse Cars
          </Link>
        </div>
      </div>
    </div>
  );
}
