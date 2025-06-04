
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Log to help diagnose API key issues
if (typeof window === 'undefined') { // Only log on the server-side
  console.log(
    "Firebase Init: NEXT_PUBLIC_FIREBASE_API_KEY is ",
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? `"${process.env.NEXT_PUBLIC_FIREBASE_API_KEY.substring(0,5)}..." (present)` : "MISSING or UNDEFINED"
  );
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    console.error("CRITICAL Firebase Init ERROR: NEXT_PUBLIC_FIREBASE_API_KEY is missing from environment variables. Please check your .env file and ensure it's correctly formatted (e.g., NEXT_PUBLIC_FIREBASE_API_KEY=yourActualApiKey) and that you've restarted your Next.js development server.");
  }
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { app, auth, db };
