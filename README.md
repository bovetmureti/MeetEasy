**MeetEasy**
**Overview**
MeetEasy is a web-based application designed to help people find each other in crowded places. The app uses real-time location tracking, synchronized proximity alerts, and a simple chat system to make meeting up with someone easier than ever.

**Features**
1. Real-time location tracking: See your and your partner's location on a map in real-time
2. Proximity detection: Receive alerts when you're within 20 meters of each other
3. Secure pairing: Connect with others using a unique 6-digit meetup code
4. Integrated chat: Communicate with your partner through the built-in chat system
5. Privacy controls: Toggle location sharing on/off whenever you want
   
**Tech Stack**
Frontend: React.js
Backend: Firebase (Authentication, Firestore)
Maps API: Google Maps JavaScript API
Geolocation: Browser Geolocation API
Hosting: Firebase Hosting

**Setup Instructions**
**Prerequisites**
Node.js (v14.0.0 or later)
npm (v7.0.0 or later)
Firebase account
Google Cloud account with Maps JavaScript API enabled

**Installation**
1. Clone the repository
git clone https://github.com/bovetmureti/MeetEasy.git
cd meeteasy
2. Install dependencies
npm install
3. Configure Firebase
Create a new Firebase project at firebase.google.com
Enable Anonymous Authentication in the Firebase Console
Create a Firestore database
Replace the Firebase configuration in src/firebase.config.js with your own
4. Configure Google Maps API
Create a project in the Google Cloud Console
Enable the Maps JavaScript API, Geolocation API, and Distance Matrix API
Create an API key with appropriate restrictions
Replace the API key in src/App.js
5. Start the development server
npm start

**Deployment**
1. Build the production-ready app
npm run build
2. Deploy to Firebase Hosting
firebase deploy

**Project Structure**

meeteasy/
├── public/                  # Public assets
│   ├── alert-sound.mp3      # Alert sound for proximity notifications
│   ├── index.html           # HTML entry point
│   └── manifest.json        # PWA manifest
├── src/
│   ├── components/          # React components
│   │   ├── AlertComponent.js    # Proximity alert component
│   │   ├── ChatComponent.js     # Chat interface
│   │   ├── MapComponent.js      # Map display with markers
│   │   └── PairingComponent.js  # User pairing functionality
│   ├── App.css              # Main application styles
│   ├── App.js               # Main application component
│   ├── firebase.config.js   # Firebase configuration
│   ├── index.css            # Global styles
│   ├── index.js             # JavaScript entry point
│   └── serviceWorker.js     # Service worker for PWA functionality
└── package.json             # Project dependencies

**Usage Guide**
**Creating a Meetup**
1. Open the app and click "Create Meetup"
2. Share the generated 6-digit code with the person you want to meet
3. Enable location sharing when prompted
4. You'll see both locations on the map and receive an alert when you're close
   
**Joining a Meetup**
1. Get the 6-digit code from the person you want to meet
2. Open the app and enter the code in the "Join a Meetup" section
3. Enable location sharing when prompted
4. You'll see both locations on the map and receive an alert when you're close
   
**Privacy and Security**
Location data is only shared between paired users
All data is stored in Firebase Firestore with appropriate security rules
Location sharing can be toggled off at any time
No personal information is required for using the app (anonymous authentication)

**Roadmap**
Add augmented reality (AR) features for more intuitive meetups
Develop native iOS and Android apps for improved performance
Implement additional privacy features and customization options
Explore partnerships with airports, malls, and other venues

**License**
This project is licensed under the MIT License - see the LICENSE file for details.


