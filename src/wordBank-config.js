import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Word bank database. Keep this app separate from the app used for auth and scores.
const firebaseConfig = {
  apiKey: 'AIzaSyBzz28k956PafBpkqOiOqY9hzprNP_xoSU',
  authDomain: 'findtheundercover-dea9c.firebaseapp.com',
  projectId: 'findtheundercover-dea9c',
  storageBucket: 'findtheundercover-dea9c.firebasestorage.app',
  messagingSenderId: '503099339526',
  appId: '1:503099339526:web:2b33b817ab4c3863212487',
  measurementId: 'G-EB1WS4DW4S'
};

const wordsApp = initializeApp(firebaseConfig, 'words-database');
const wordsDb = getFirestore(wordsApp);

export { wordsDb };
