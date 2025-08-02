import React from 'react';

function Settings() {
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
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      marginBottom: '1.5rem',
    },
    label: {
      fontWeight: 500,
      marginBottom: '0.5rem',
      fontSize: '1.1rem',
      color: '#334155',
    },
    select: {
      marginLeft: '0.5rem',
      borderRadius: '8px',
      padding: '0.25rem 0.5rem',
      border: '1px solid #e0e7ff',
      fontSize: '1rem',
    },
    checkbox: {
      marginLeft: '0.5rem',
      accentColor: '#6366f1',
    },
    desc: {
      color: '#555',
      fontSize: '1.1rem',
      textAlign: 'center',
    },
    emoji: {
      fontSize: '1.5rem',
      marginRight: '0.5rem',
      verticalAlign: 'middle',
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Settings</h2>
      <form style={styles.form} aria-label="Settings form">
        <label style={styles.label}>
          <span style={styles.emoji} role="img" aria-label="resolution">🖼️</span>
          Camera Resolution:
          <select style={styles.select}>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </label>
        <label style={styles.label}>
          <span style={styles.emoji} role="img" aria-label="flash">⚡</span>
          Flash:
          <input style={styles.checkbox} type="checkbox" />
        </label>
        <label style={styles.label}>
          <span style={styles.emoji} role="img" aria-label="theme">🌗</span>
          Theme:
          <select style={styles.select}>
            <option>Light</option>
            <option>Dark</option>
          </select>
        </label>
      </form>
      <p style={styles.desc}>
        Adjust your camera and app settings here.<br />
        <span role="img" aria-label="settings">⚙️</span> Accessible, bold, and mobile-first!
      </p>
    </div>
  );
}

export default Settings;