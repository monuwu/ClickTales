import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import Compliment from './compliments';

const Camera = () => {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [timer, setTimer] = useState(3); // default 3 seconds

  const [gallery, setGallery] = useState(() => {
    const saved = localStorage.getItem('clicktales-gallery');
    return saved ? JSON.parse(saved).slice(0, 3) : [];
  });

  const capture = () => {
    setCountdown(timer);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          const screenshot = webcamRef.current.getScreenshot();
          if (screenshot) {
            setImage(screenshot);
            const updatedGallery = [screenshot, ...gallery].slice(0, 3);
            setGallery(updatedGallery);
            localStorage.setItem('clicktales-gallery', JSON.stringify(updatedGallery));
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const retake = () => {
    setImage(null);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>ClickTales Camera</h2>

      {!image ? (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          {/* Webcam */}
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={400}
            videoConstraints={{ facingMode: 'user' }}
            style={{
              borderRadius: '12px',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            }}
          />

          {/* Countdown Display */}
          {countdown && (
            <div
              style={{
                position: 'absolute',
                top: '40%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '72px',
                fontWeight: 'bold',
                color: 'white',
                textShadow: '2px 2px 6px rgba(0,0,0,0.6)',
              }}
            >
              {countdown}
            </div>
          )}

          {/* Capture Button */}
          <button
            onClick={capture}
            disabled={countdown !== null}
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '64px',
              height: '64px',
              backgroundColor: 'transparent',
              border: '2px solid white',
              borderRadius: '50%',
              cursor: countdown ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              opacity: countdown ? 0.5 : 1,
            }}
          >
            <span style={{ fontSize: '24px', color: 'white' }}>📷</span>
          </button>

          {/* Timer Selector */}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              display: 'flex',
              flexDirection: 'row',
              gap: '6px',
            }}
          >
            {[2, 3, 5, 10].map((val) => (
              <button
                key={val}
                onClick={() => setTimer(val)}
                style={{
                  padding: '4px 10px',
                  fontSize: '12px',
                  borderRadius: '6px',
                  backgroundColor: timer === val ? '#e9b0a4ff' : '#ffffff99',
                  border: 'none',
                  color: '#333',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                {val}s
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <img src={image} alt="Captured" width={400} style={{ borderRadius: '12px' }} />
          <Compliment />
          <br />
          <button onClick={retake}>🔁 Retake</button>
        </>
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3>Latest 3 Photos</h3>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '24px',
              justifyContent: 'center',
              marginTop: '20px',
            }}
          >
            {gallery.map((img, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '12px',
                  padding: '10px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                <img
                  src={img}
                  alt={`snap-${index}`}
                  width={250}
                  height="auto"
                  style={{
                    borderRadius: '10px',
                    boxShadow: '0 0 12px rgba(0,0,0,0.25)',
                    marginBottom: '10px',
                  }}
                />
                <a
                  href={img}
                  download={`ClickTales_Photo_${index + 1}.jpg`}
                  style={{
                    fontSize: '14px',
                    backgroundColor: '#e9b0a4ff',
                    color: 'white',
                    padding: '6px 12px',
                    textDecoration: 'none',
                    borderRadius: '6px',
                  }}
                >
                  📥 Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Camera;
