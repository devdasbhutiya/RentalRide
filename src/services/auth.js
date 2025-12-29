import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    updateProfile,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

// Sign up new user
export const signUp = async (email, password, name, phone = '') => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update profile with display name
        await updateProfile(user, { displayName: name });

        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            email: email,
            name: name,
            phone: phone,
            createdAt: serverTimestamp(),
            avatar: ''
        });

        return { user, error: null };
    } catch (error) {
        return { user: null, error: error.message };
    }
};

// Sign in existing user
export const signIn = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { user: userCredential.user, error: null };
    } catch (error) {
        return { user: null, error: error.message };
    }
};

// Sign out user
export const signOut = async () => {
    try {
        await firebaseSignOut(auth);
        return { error: null };
    } catch (error) {
        return { error: error.message };
    }
};

// Get user profile from Firestore
export const getUserProfile = async (uid) => {
    try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { profile: { id: docSnap.id, ...docSnap.data() }, error: null };
        } else {
            return { profile: null, error: 'User profile not found' };
        }
    } catch (error) {
        return { profile: null, error: error.message };
    }
};

// Update user profile
export const updateUserProfile = async (uid, data) => {
    try {
        const docRef = doc(db, 'users', uid);
        await setDoc(docRef, data, { merge: true });
        return { error: null };
    } catch (error) {
        return { error: error.message };
    }
};

// Auth state observer
export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};
