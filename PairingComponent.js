import React, { useState } from 'react';
import './PairingComponent.css';

const PairingComponent = ({ createMeetup, joinMeetup }) => {
  const [joinCode, setJoinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateMeetup = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const code = await createMeetup();
      
      if (!code) {
        setError('Failed to create meetup. Please try again.');
      }
    } catch (error) {
      console.error("Error in create meetup:", error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinMeetup = async (e) => {
    e.preventDefault();
    
    if (!joinCode || joinCode.length !== 6) {
      setError('Please enter a valid 6-digit meetup code.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const success = await joinMeetup(joinCode);
      
      if (!success) {
        setError('Failed to join meetup. Please check the code and try again.');
      }
    } catch (error) {
      console.error("Error in join meetup:", error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pairing-container">
      <div className="welcome-message">
        <h2>Welcome to MeetEasy</h2>
        <p>The easiest way to find each other in crowded places!</p>
      </div>
      
      <div className="pairing-options">
        <div className="create-meetup">
          <h3>Create a Meetup</h3>
          <p>Generate a code and share it with the person you want to meet</p>
          <button 
            onClick={handleCreateMeetup} 
            disabled={isLoading}
            className="create-button"
          >
            {isLoading ? 'Creating...' : 'Create Meetup'}
          </button>
        </div>
        
        <div className="divider">OR</div>
        
        <div className="join-meetup">
          <h3>Join a Meetup</h3>
          <p>Enter the 6-digit code shared with you</p>
          <form onSubmit={handleJoinMeetup}>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.slice(0, 6))}
              placeholder="Enter 6-digit code"
              maxLength={6}
              pattern="[0-9]{6}"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading}
              className="join-button"
            >
              {isLoading ? 'Joining...' : 'Join Meetup'}
            </button>
          </form>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="permissions-notice">
        <p>MeetEasy needs location permission to work. Your location is only shared with your meetup partner.</p>
      </div>
    </div>
  );
};

export default PairingComponent;
