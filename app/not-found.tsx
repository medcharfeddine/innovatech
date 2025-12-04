import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      padding: '2rem',
    }}>
      <div style={{
        textAlign: 'center',
        backgroundColor: 'white',
        padding: '3rem',
        borderRadius: '0.75rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        maxWidth: '600px',
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 700,
          color: '#df172e',
          margin: '0 0 1rem 0',
        }}>
          404
        </h1>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          color: '#2a317f',
          margin: '0 0 1rem 0',
        }}>
          Page Not Found
        </h2>
        <p style={{
          fontSize: '1rem',
          color: '#666',
          margin: '0 0 2rem 0',
          lineHeight: '1.6',
        }}>
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" style={{
          display: 'inline-block',
          padding: '0.75rem 2rem',
          backgroundColor: '#2a317f',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '0.5rem',
          fontWeight: 600,
          transition: 'background-color 150ms ease',
        }}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
