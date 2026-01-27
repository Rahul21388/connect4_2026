/**
 * ========================================
 * FIREBASE CONFIGURATION
 * ========================================
 * 
 * INSTRUCTIONS TO SET UP YOUR FIREBASE PROJECT:
 * 
 * 1. Go to https://console.firebase.google.com/
 * 2. Click "Create a project" or select existing project
 * 3. Once created, click the gear icon (⚙️) next to "Project Overview"
 * 4. Select "Project settings"
 * 5. Scroll down to "Your apps" section
 * 6. Click the web icon (</>) to add a web app
 * 7. Register your app with a nickname (e.g., "Connect4")
 * 8. Copy the firebaseConfig object values below
 * 
 * 9. ENABLE FIRESTORE:
 *    - In Firebase Console, go to "Build" > "Firestore Database"
 *    - Click "Create database"
 *    - Choose "Start in test mode" for development
 *    - Select your preferred location
 *    - Click "Enable"
 * 
 * 10. REPLACE the placeholder values below with your actual Firebase config
 * 
 * ========================================
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ========================================
// 🔥 REPLACE THESE VALUES WITH YOUR FIREBASE CONFIG 🔥
// ========================================
const firebaseConfig = {
  apiKey: "AIzaSyCCBVKdTz_rIqAlm-DR6JslyxUiMMaOzjE",
  authDomain: "connect4-ai-game.firebaseapp.com",
  projectId: "connect4-ai-game",
  storageBucket: "connect4-ai-game.firebasestorage.app",
  messagingSenderId: "383008470138",
  appId: "1:383008470138:web:1d44a627fdb161c2ba37c3"
};
// ========================================
// END OF FIREBASE CONFIG
// ========================================

// Check if Firebase is configured
export const isFirebaseConfigured = () => {
  return (
    firebaseConfig.apiKey !== "YOUR_API_KEY_HERE" &&
    firebaseConfig.projectId !== "YOUR_PROJECT_ID" &&
    firebaseConfig.apiKey.length > 0
  );
};

// Initialize Firebase
let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.log('Firebase initialization error:', error);
}

export { app, db };
export default firebaseConfig;
