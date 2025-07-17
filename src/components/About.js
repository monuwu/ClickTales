import React from 'react';

function About() {
  const styles = {
    container: {
      padding: '2rem',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
      borderRadius: '24px',
      boxShadow: '0 8px 32px rgba(60,60,120,0.08)',
      maxWidth: '600px',
      margin: '2rem auto',
      color: '#222',
      fontFamily: 'Inter, Arial, sans-serif',
      position: 'relative',
      transition: 'background 0.3s',
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 800,
      marginBottom: '1.5rem',
      letterSpacing: '-1px',
      fontFamily: '"Montserrat", Inter, Arial, sans-serif',
      color: '#1e293b',
      textShadow: '0 2px 8px rgba(60,60,120,0.08)',
    },
    desc: {
      marginBottom: '1.5rem',
      color: '#333',
      fontSize: '1.2rem',
      lineHeight: '1.7',
      fontWeight: 400,
      background: 'rgba(255,255,255,0.7)',
      borderRadius: '8px',
      padding: '1rem',
      boxShadow: '0 2px 8px rgba(60,60,120,0.04)',
    },
    list: {
      listStyle: 'none',
      marginLeft: 0,
      color: '#555',
      padding: 0,
      fontSize: '1.1rem',
      fontWeight: 500,
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
      transition: 'background 0.2s',
    },
    emoji: {
      fontSize: '2rem',
      marginRight: '0.5rem',
      verticalAlign: 'middle',
      filter: 'drop-shadow(0 2px 4px rgba(60,60,120,0.08))',
    },
    cursor: {
      cursor: 'pointer',
    },
    darkToggle: {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      background: '#222',
      color: '#fff',
      border: 'none',
      borderRadius: '50%',
      width: '2.5rem',
      height: '2.5rem',
      fontSize: '1.2rem',
      cursor: 'pointer',
      boxShadow: '0 2px 8px rgba(60,60,120,0.08)',
      transition: 'background 0.3s',
    },
  };

  // Dark mode toggle
  const [dark, setDark] = React.useState(false);

  return (
    <div
      style={{
        ...styles.container,
        background: dark
          ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
          : styles.container.background,
        color: dark ? '#f8fafc' : styles.container.color,
      }}
    >
      <button
        style={styles.darkToggle}
        aria-label="Toggle dark mode"
        onClick={() => setDark((d) => !d)}
      >
        {dark ? '🌙' : '☀️'}
      </button>
      <h2 style={styles.title}>About ClickTales</h2>
      <p style={styles.desc}>
        <span style={styles.emoji} role="img" aria-label="camera">📸</span>
        ClickTales is a modern photo app where you can capture, edit, and organize your memories.<br />
        Explore features like gallery, favorites, and more!<br />
        <span style={styles.emoji} role="img" aria-label="3D">🧊</span>
        Experience 3D visuals, bold typography, and micro-interactions.<br />
        <span style={styles.emoji} role="img" aria-label="AI">🤖</span>
        AI-driven personalization and accessibility for everyone.
      </p>
      <ul style={styles.list}>
        <li style={styles.listItem}>Easy photo capture</li>
        <li style={styles.listItem}>Gallery and favorites</li>
        <li style={styles.listItem}>Photo editing tools</li>
        <li style={styles.listItem}>Customizable settings</li>
        <li style={styles.listItem}>Mobile-first & accessible design</li>
        <li style={styles.listItem}>Gradient color schemes & organic shapes</li>
        <li style={styles.listItem}>Retro revival with a modern twist</li>
        <li style={styles.listItem}>Sustainable & energy-efficient</li>
        <li style={styles.listItem}>Voice user interfaces & AI-generated imagery</li>
        <li style={styles.listItem}>Interactive cursors & micro-interactions</li>
        <li style={styles.listItem}>Storytelling through design</li>
      </ul>
    </div>
  );
}

export default About;