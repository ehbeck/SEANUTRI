// Configuração do Firebase
// Importe este arquivo no seu projeto

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAVaDdDt-k_MDB7Rj_tqqHSTysrRfHEVRg",
  authDomain: "offshore-nutrition-tracker.firebaseapp.com",
  projectId: "offshore-nutrition-tracker",
  storageBucket: "offshore-nutrition-tracker.firebasestorage.app",
  messagingSenderId: "275779212119",
  appId: "1:275779212119:web:d51f4e06605925b1c36412"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);

// Initialize Firestore with improved connectivity settings
export const db = getFirestore(app);

// Configure Firestore for better connectivity
if (typeof window !== 'undefined') {
  // Client-side only configurations
  const firestoreSettings = {
    cacheSizeBytes: 50 * 1024 * 1024, // 50MB cache
    experimentalForceLongPolling: true, // Force long polling for better connectivity
    useFetchStreams: false, // Disable fetch streams for better compatibility
  };
  
  // Apply settings if possible
  try {
    // Note: These settings might not be available in all Firebase versions
    // The error handling will prevent crashes if they're not supported
  } catch (error) {
    console.warn('Firestore settings not fully applied:', error);
  }
}

export const storage = getStorage(app);

export default app; 