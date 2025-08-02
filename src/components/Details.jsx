import React from 'react';

function Details() {
  const styles = {
    container: {
      padding: '2rem',
      background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)',
      borderRadius: '24px',
      boxShadow: '0 8px 32px rgba(60,60,120,0.08)',
      maxWidth: '600px',
      margin: '2rem auto',
      color: '#222',
      fontFamily: 'Inter, Arial, sans-serif',
      transition: 'background 0.3s',
    },
    title: {
      fontSize: '2rem',
      fontWeight: 700,
      marginBottom: '1.5rem',
      fontFamily: '"Montserrat", Inter, Arial, sans-serif',
      color: '#1e293b',
      textShadow: '0 2px 8px rgba(60,60,120,0.08)',
    },
    list: {
      listStyle: 'none',
      padding: 0,
      marginBottom: '1.5rem',
      display: 'grid',
      gap: '0.75rem',
    },
    listItem: {
      background: 'linear-gradient(90deg, #e0e7ff 0%, #f8fafc 100%)',
      borderRadius: '8px',
      padding: '0.75rem 1rem',
      boxShadow: '0 1px 4px rgba(60,60,120,0.04)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontWeight: 500,
      fontSize: '1.1rem',
      transition: 'background 0.2s',
    },
    emoji: {
      fontSize: '1.5rem',
      marginRight: '0.5rem',
      verticalAlign: 'middle',
    },
    desc: {
      color: '#555',
      fontSize: '1.1rem',
      textAlign: 'center',
    },
  };

  const details = [
    { label: 'Date', value: '2025-07-17', emoji: '📅' },
    { label: 'Location', value: 'New York, USA', emoji: '📍' },
    { label: 'Resolution', value: '1200x800', emoji: '🖼️' },
    { label: 'Size', value: '1.2MB', emoji: '💾' },
    { label: 'AI Tag', value: 'Sunset', emoji: '🤖' },
  ];

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Photo Details</h2>
      <ul style={styles.list}>
        {details.map((item, idx) => (
          <li key={item.label} style={styles.listItem}>
            <span style={styles.emoji} role="img" aria-label={item.label}>{item.emoji}</span>
            <strong>{item.label}:</strong> {item.value}
          </li>
        ))}
      </ul>
      <p style={styles.desc}>
        View photo metadata here.<br />
        <span role="img" aria-label="details">🔎</span> Accessible, bold, and immersive!
      </p>
    </div>
  );
}

export default Details;