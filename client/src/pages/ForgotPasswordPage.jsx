import { useForm } from 'react-hook-form';
import { forgotPassword } from '../api/auth';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const [sent, setSent] = useState(false);

  async function onSubmit({ email }) {
    await forgotPassword(email);
    setSent(true);
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Forgot password?</h2>
        <p className="text-gray-500 text-sm mb-6">We'll send a reset link to your email.</p>
        {sent ? (
          <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm">
            If that email exists, a reset link has been sent. Check your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                {...register('email', { required: true })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-60"
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
        <p className="text-sm text-center mt-4">
          <Link to="/login" className="text-blue-600 hover:underline">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
