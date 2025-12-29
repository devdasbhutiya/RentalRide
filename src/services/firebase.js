import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCblcytnuyQ2ODZnvTbGekTIocd_AY0RWk",
  authDomain: "karmyog-app.firebaseapp.com",
  databaseURL: "https://karmyog-app-default-rtdb.firebaseio.com",
  projectId: "karmyog-app",
  storageBucket: "karmyog-app.appspot.com",
  messagingSenderId: "181429395387",
  appId: "1:181429395387:web:751a7b699b07a394b9ee9e",
  measurementId: "G-34V2E8840C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
