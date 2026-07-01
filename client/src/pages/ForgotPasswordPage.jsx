import { useForm } from 'react-hook-form';
import { forgotPassword } from '../api/auth';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const { register, handleSubmit } = useForm();
  const [message, setMessage] = useState('');

  async function onSubmit({ email }) {
    await forgotPassword(email);
    setMessage('If that email exists, a reset link has been sent.');
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 24 }}>
      <h2>Forgot Password</h2>
      {message ? <p style={{ color: 'green' }}>{message}</p> : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: 12 }}>
            <input placeholder="Your email" type="email" {...register('email', { required: true })} style={{ width: '100%', padding: 8 }} />
          </div>
          <button type="submit" style={{ width: '100%', padding: 10, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            Send Reset Link
          </button>
        </form>
      )}
      <p style={{ marginTop: 16 }}><Link to="/login">Back to Login</Link></p>
    </div>
  );
}
