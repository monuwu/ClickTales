import React from 'react';

function Favorites() {
  const styles = {
    container: {
      padding: '2rem',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
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
      background: 'linear-gradient(120deg, #ffb6c1 60%, #e0e7ff 100%)',
      borderRadius: '16px',
      boxShadow: '0 2px 8px rgba(60,60,120,0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      transition: 'transform 0.2s',
      cursor: 'pointer',
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
    emoji: {
      fontSize: '1.5rem',
      marginRight: '0.5rem',
      verticalAlign: 'middle',
    },
  };

  // Micro-interaction: scale on hover
  const handleMouseOver = (e) => {
    e.currentTarget.style.transform = 'scale(1.08)';
  };
  const handleMouseOut = (e) => {
    e.currentTarget.style.transform = 'scale(1)';
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Favorites</h2>
      <div style={styles.grid}>
        {[1, 2].map((i) => (
          <div
            key={i}
            style={styles.item}
            tabIndex={0}
            aria-label={`Favorite image ${i}`}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
          >
            <img
              style={styles.img}
              src={`https://via.placeholder.com/120/ffb6c1?text=Fav+${i}`}
              alt={`Favorite ${i}`}
            />
          </div>
        ))}
      </div>
      <p style={styles.desc}>
        Your favorite photos will be listed here.<br />
        <span style={styles.emoji} role="img" aria-label="favorites">❤️</span> Interactive, accessible, and visually engaging!
      </p>
    </div>
  );
}

export default Favorites;