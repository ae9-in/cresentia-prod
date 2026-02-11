import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Verifying email...');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setMessage('Missing verification token');
      return;
    }

    api
      .get('/auth/verify-email', { params: { token } })
      .then((res) => setMessage(res.data.message))
      .catch((err) => setMessage(err.response?.data?.message || 'Verification failed'));
  }, [searchParams]);

  return (
    <main className="container page">
      <div className="card">
        <h2>Email Verification</h2>
        <p>{message}</p>
      </div>
    </main>
  );
};

export default VerifyEmailPage;
