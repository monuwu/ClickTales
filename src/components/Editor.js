import React from 'react';

function Editor() {
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
    tools: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '1.5rem',
      flexWrap: 'wrap',
    },
    btn: {
      background: 'linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)',
      color: '#fff',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '12px',
      fontWeight: 600,
      fontSize: '1rem',
      cursor: 'pointer',
      boxShadow: '0 2px 8px rgba(60,60,120,0.08)',
      transition: 'background 0.2s, transform 0.2s',
    },
    btnHover: {
      background: 'linear-gradient(90deg, #60a5fa 0%, #6366f1 100%)',
      transform: 'scale(1.08)',
    },
    desc: {
      color: '#555',
      fontSize: '1.1rem',
      textAlign: 'center',
    },
  };

  // Micro-interaction: button hover
  const [hovered, setHovered] = React.useState(null);

  const toolNames = [
    { name: 'Crop', emoji: '✂️' },
    { name: 'Rotate', emoji: '🔄' },
    { name: 'Filter', emoji: '🎨' },
    { name: 'AI Enhance', emoji: '🤖' },
  ];

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Photo Editor</h2>
      <div style={styles.tools}>
        {toolNames.map((tool, idx) => (
          <button
            key={tool.name}
            style={hovered === idx ? { ...styles.btn, ...styles.btnHover } : styles.btn}
            onMouseOver={() => setHovered(idx)}
            onMouseOut={() => setHovered(null)}
            aria-label={tool.name}
          >
            <span role="img" aria-label={tool.name}>{tool.emoji}</span> {tool.name}
          </button>
        ))}
      </div>
      <p style={styles.desc}>
        Edit your photos here (crop, rotate, add filters, AI enhancements).<br />
        <span role="img" aria-label="editor">🛠️</span> Micro-interactions, bold typography, and accessibility!
      </p>
    </div>
  );
}

export default Editor;