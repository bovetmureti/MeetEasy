import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, collection, addDoc, query, orderBy } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { Loader } from '@googlemaps/js-api-loader';
import './App.css';
import MapComponent from './components/MapComponent';
import PairingComponent from './components/PairingComponent';
import ChatComponent from './components/ChatComponent';
import AlertComponent from './components/AlertComponent';

// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "meeteasy-app.firebaseapp.com",
  projectId: "meeteasy-app",
  storageBucket: "meeteasy-app.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Google Maps API key
const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY";

function App() {
  // State variables
  const [user, setUser] = useState(null);
  const [meetupCode, setMeetupCode] = useState('');
  const [pairingComplete, setPairingComplete] = useState(false);
  const [location, setLocation] = useState(null);
  const [partnerLocation, setPartnerLocation] = useState(null);
  const [proximityAlert, setProximityAlert] = useState(false);
  const [sharingLocation, setSharingLocation] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [messages, setMessages] = useState([]);
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);

  // Initialize Firebase
  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const authentication = getAuth(app);
    
    setDb(firestore);
    setAuth(authentication);
    
    // Load Google Maps API
    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: "weekly",
      libraries: ["places", "geometry"]
    });
    
    loader.load().then(() => {
      setMapLoaded(true);
    });
    
    // Sign in anonymously
    signInAnonymously(authentication)
      .then(result => {
        setUser(result.user);
      })
      .catch(error => {
        console.error("Error signing in:", error);
      });
  }, []);

  // Watch user's location
  useEffect(() => {
    if (!user || !sharingLocation) return;
    
    const watchId = navigator.geolocation.watchPosition(
      position => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: new Date().toISOString()
        };
        setLocation(newLocation);
        
        // Update location in Firestore if paired
        if (pairingComplete && db && meetupCode) {
          const userLocationRef = doc(db, `meetups/${meetupCode}/locations/${user.uid}`);
          setDoc(userLocationRef, newLocation);
        }
      },
      error => {
        console.error("Error getting location:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 10000
      }
    );
    
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [user, sharingLocation, pairingComplete, db, meetupCode]);

  // Watch partner's location
  useEffect(() => {
    if (!pairingComplete || !db || !user || !meetupCode) return;
    
    // Get all users in the meetup
    const meetupRef = collection(db, `meetups/${meetupCode}/locations`);
    
    const unsubscribe = onSnapshot(meetupRef, snapshot => {
      snapshot.docs.forEach(doc => {
        // Only set partner location if it's not the current user
        if (doc.id !== user.uid) {
          setPartnerLocation(doc.data());
        }
      });
    });
    
    return () => unsubscribe();
  }, [pairingComplete, db, user, meetupCode]);

  // Check proximity between users
  useEffect(() => {
    if (!location || !partnerLocation || !window.google) return;
    
    // Calculate distance using Google Maps geometry library
    const userLatLng = new window.google.maps.LatLng(location.lat, location.lng);
    const partnerLatLng = new window.google.maps.LatLng(partnerLocation.lat, partnerLocation.lng);
    
    const distance = window.google.maps.geometry.spherical.computeDistanceBetween(userLatLng, partnerLatLng);
    
    // Set proximity alert if users are within 20 meters
    const isNearby = distance <= 20;
    
    if (isNearby !== proximityAlert) {
      setProximityAlert(isNearby);
      
      // Update proximity status in Firestore
      if (db && meetupCode) {
        const proximityRef = doc(db, `meetups/${meetupCode}`);
        setDoc(proximityRef, { proximityAlert: isNearby }, { merge: true });
      }
    }
  }, [location, partnerLocation, db, meetupCode, proximityAlert]);

  // Listen for chat messages
  useEffect(() => {
    if (!pairingComplete || !db || !meetupCode) return;
    
    const messagesRef = collection(db, `meetups/${meetupCode}/messages`);
    const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(messagesQuery, snapshot => {
      const messageList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setMessages(messageList);
    });
    
    return () => unsubscribe();
  }, [pairingComplete, db, meetupCode]);

  // Generate a random 6-digit meetup code
  const generateMeetupCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setMeetupCode(code);
    return code;
  };

  // Create a new meetup
  const createMeetup = async () => {
    if (!db || !user) return;
    
    const code = generateMeetupCode();
    
    try {
      // Create meetup document
      await setDoc(doc(db, 'meetups', code), {
        createdAt: new Date().toISOString(),
        createdBy: user.uid,
        proximityAlert: false
      });
      
      // Set initial user location
      if (location) {
        await setDoc(doc(db, `meetups/${code}/locations/${user.uid}`), location);
      }
      
      setPairingComplete(true);
      
      return code;
    } catch (error) {
      console.error("Error creating meetup:", error);
      return null;
    }
  };

  // Join an existing meetup
  const joinMeetup = async (code) => {
    if (!db || !user) return false;
    
    try {
      // Check if meetup exists
      const meetupDoc = await getDoc(doc(db, 'meetups', code));
      
      if (!meetupDoc.exists()) {
        alert("Invalid meetup code. Please try again.");
        return false;
      }
      
      setMeetupCode(code);
      
      // Set initial user location
      if (location) {
        await setDoc(doc(db, `meetups/${code}/locations/${user.uid}`), location);
      }
      
      setPairingComplete(true);
      return true;
    } catch (error) {
      console.error("Error joining meetup:", error);
      return false;
    }
  };

  // Send a chat message
  const sendMessage = async (text) => {
    if (!db || !user || !meetupCode) return;
    
    try {
      await addDoc(collection(db, `meetups/${meetupCode}/messages`), {
        text,
        userId: user.uid,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Toggle location sharing
  const toggleLocationSharing = () => {
    setSharingLocation(!sharingLocation);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>MeetEasy</h1>
        {pairingComplete && (
          <div className="meetup-info">
            <p>Meetup Code: <strong>{meetupCode}</strong></p>
            <button 
              onClick={toggleLocationSharing} 
              className={sharingLocation ? "active" : ""}
            >
              {sharingLocation ? "Sharing Location" : "Location Sharing Off"}
            </button>
          </div>
        )}
      </header>
      
      <main>
        {!pairingComplete ? (
          <PairingComponent 
            createMeetup={createMeetup} 
            joinMeetup={joinMeetup} 
          />
        ) : (
          <div className="meetup-container">
            {mapLoaded && (
              <MapComponent 
                userLocation={location}
                partnerLocation={partnerLocation}
                setMapInstance={setMapInstance}
              />
            )}
            
            <ChatComponent 
              messages={messages} 
              sendMessage={sendMessage} 
              userId={user?.uid} 
            />
            
            {proximityAlert && (
              <AlertComponent />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
