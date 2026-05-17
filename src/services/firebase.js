import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBUlfJOmmy1ZHYSbAnpIqvAHbkSO2PNU9o",
  authDomain: "cryptix-6c09a.firebaseapp.com",
  databaseURL: "https://cryptix-6c09a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cryptix-6c09a",
  storageBucket: "cryptix-6c09a.firebasestorage.app",
  messagingSenderId: "30088243791",
  appId: "1:30088243791:web:fd7e0d013a6005af67583a",
  measurementId: "G-P6V09DQDFW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
