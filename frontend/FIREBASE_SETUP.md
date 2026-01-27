# 🔥 Firebase Setup Instructions for Connect 4

This guide will help you set up Firebase for your Connect 4 game to enable:
- User profile persistence
- Score tracking (wins, losses, draws)
- Live leaderboard

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter your project name (e.g., "Connect4Game")
4. Optionally enable Google Analytics
5. Click **Create project**

## Step 2: Enable Firestore Database

1. In your Firebase project, click **"Build"** in the left sidebar
2. Select **"Firestore Database"**
3. Click **"Create database"**
4. Choose **"Start in test mode"** (for development)
5. Select your preferred location
6. Click **"Enable"**

## Step 3: Get Your Firebase Configuration

1. In Firebase Console, click the **gear icon (⚙️)** next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **web icon (`</>`)**
5. Register your app with a nickname (e.g., "Connect4Web")
6. Copy the `firebaseConfig` object

## Step 4: Update Your App

Open `/frontend/src/firebase/config.ts` and replace the placeholder values:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

## Step 5: Set Up Firestore Security Rules (Production)

For production, update your Firestore rules in Firebase Console:

1. Go to **Firestore Database** → **Rules**
2. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{username} {
      // Anyone can read (for leaderboard)
      allow read: if true;
      
      // Only allow creation if document doesn't exist
      allow create: if true;
      
      // Allow updates (for stats)
      allow update: if true;
    }
  }
}
```

3. Click **Publish**

## Step 6: Test Your Setup

1. Restart your app
2. The warning "Firebase not configured" should disappear from the login screen
3. Try logging in with a username
4. Play a game and check if stats are saved
5. Check the leaderboard to see if it updates

## Firestore Data Structure

The app creates documents in the `users` collection:

```
users/
  └── {username}/
      ├── username: "player123"
      ├── wins: 0
      ├── losses: 0
      ├── draws: 0
      ├── totalGames: 0
      └── lastPlayed: timestamp
```

## Troubleshooting

### "Firebase not configured" warning still showing
- Make sure you replaced ALL placeholder values
- Restart the Expo development server

### Leaderboard showing mock data
- Verify Firestore is enabled
- Check your Firebase config values
- Look for errors in the console

### Stats not saving
- Check Firestore rules allow writes
- Verify network connectivity
- Check for errors in console logs

## Building for Production (Android AAB)

Once Firebase is configured, you can build for Google Play Store:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build AAB for Play Store
eas build -p android --profile production
```

---

Need help? Check the [Firebase Documentation](https://firebase.google.com/docs/web/setup) or [Expo Firebase Guide](https://docs.expo.dev/guides/using-firebase/).
