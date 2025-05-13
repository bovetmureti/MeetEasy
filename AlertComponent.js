import React, { useEffect, useState } from 'react';
import './AlertComponent.css';

const AlertComponent = () => {
  const [visible, setVisible] = useState(true);
  const [audio] = useState(() => new Audio('/alert-sound.mp3'));
  
  useEffect(() => {
    // Play sound when alert appears
    try {
      audio.play().catch(e => {
        // Handle autoplay restrictions
        console.warn("Could not play alert sound:", e);
      });
    } catch (error) {
      console.error("Error playing sound:", error);
    }
    
    // Flash effect - toggle visibility
    const flashInterval = setInterval(() => {
      setVisible(prev => !prev);
    }, 500);
    
    // Auto-dismiss after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(flashInterval);
      setVisible(true);
    }, 10000);
    
    return () => {
      clearInterval(flashInterval);
      clearTimeout(timeout);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audio]);
  
  return (
    <div className={`proximity-alert ${visible ? 'visible' : 'hidden'}`}>
      <div className="alert-content">
        <div className="alert-icon">
          <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </div>
        <div className="alert-message">
          <h3>You're close!</h3>
          <p>Your meetup partner is nearby</p>
        </div>
      </div>
    </div>
  );
};

export default AlertComponent;
