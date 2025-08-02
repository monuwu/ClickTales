import React from 'react';

function Gallery() {
  const styles = {
    container: {
      padding: '2rem',
      background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)',
      borderRadius: '24px',
      boxShadow: '0 8px 32px rgba(60,60,120,0.08)',
      maxWidth: '700px',
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
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: '1.5rem',
      marginBottom: '1.5rem',
    },
    item: {
      background: 'linear-gradient(120deg, #f8fafc 60%, #e0e7ff 100%)',
      borderRadius: '16px',
      boxShadow: '0 2px 8px rgba(60,60,120,0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      transition: 'transform 0.2s',
    },
    img: {
      borderRadius: '12px',
      width: '100%',
      height: 'auto',
      boxShadow: '0 2px 8px rgba(60,60,120,0.10)',
    },
    desc: {
      color: '#555',
      fontSize: '1.1rem',
      textAlign: 'center',
    },
  };

  // Micro-interaction: scale on hover
  const handleMouseOver = (e) => {
    e.currentTarget.style.transform = 'scale(1.05)';
  };
  const handleMouseOut = (e) => {
    e.currentTarget.style.transform = 'scale(1)';
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Gallery</h2>
      <div style={styles.grid}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={styles.item}
            tabIndex={0}
            aria-label={`Sample image ${i}`}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
          >
            <img
              style={styles.img}
              src={`https://via.placeholder.com/120?text=Photo+${i}`}
              alt={`Sample ${i}`}
            />
          </div>
        ))}
      </div>
      <p style={styles.desc}>
        Your captured photos will appear here.<br />
        <span role="img" aria-label="gallery">🖼️</span> 3D grid, micro-interactions, and accessibility included!
      </p>
    </div>
  );
}

export default Gallery;