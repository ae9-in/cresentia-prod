import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();

  const details = useMemo(() => {
    if (!user) return [];

    return [
      { label: 'Name', value: user.name || 'Not set' },
      { label: 'Email', value: user.email || 'Not set' },
      { label: 'Role', value: user.role || 'Not set' },
      { label: 'User ID', value: user._id || 'Not available' },
      { label: 'Verified', value: user.isVerified ? 'Yes' : 'No' },
      { label: 'Active', value: user.isActive ? 'Yes' : 'No' }
    ];
  }, [user]);

  return (
    <main className="container page">
      <section className="card" style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>User Details</h1>
          <p className="muted">
            Review your account details and jump back into the courses module whenever you are ready.
          </p>
        </div>

        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link className="primary-btn" to="/courses">Browse Courses</Link>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {details.map((item) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '1rem',
                padding: '1rem 1.25rem',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.03)'
              }}
            >
              <span className="muted" style={{ fontWeight: 600 }}>{item.label}</span>
              <span style={{ textAlign: 'right', wordBreak: 'break-word' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default DashboardPage;
