import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

const BOOKINGS_COLLECTION = 'bookings';

// Create new booking
export const createBooking = async (bookingData) => {
    try {
        const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), {
            ...bookingData,
            status: 'pending',
            createdAt: serverTimestamp()
        });

        return { id: docRef.id, error: null };
    } catch (error) {
        return { id: null, error: error.message };
    }
};

// Get user's bookings (as renter)
export const getUserBookings = async (userId) => {
    try {
        const q = query(
            collection(db, BOOKINGS_COLLECTION),
            where('renterId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const bookings = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return { bookings, error: null };
    } catch (error) {
        return { bookings: [], error: error.message };
    }
};

// Get bookings for owner's vehicles
export const getOwnerBookings = async (ownerId) => {
    try {
        const q = query(
            collection(db, BOOKINGS_COLLECTION),
            where('ownerId', '==', ownerId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const bookings = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return { bookings, error: null };
    } catch (error) {
        return { bookings: [], error: error.message };
    }
};

// Get bookings for a specific vehicle
export const getVehicleBookings = async (vehicleId) => {
    try {
        const q = query(
            collection(db, BOOKINGS_COLLECTION),
            where('vehicleId', '==', vehicleId),
            orderBy('startDate', 'asc')
        );

        const querySnapshot = await getDocs(q);
        const bookings = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return { bookings, error: null };
    } catch (error) {
        return { bookings: [], error: error.message };
    }
};

// Update booking status
export const updateBookingStatus = async (bookingId, status) => {
    try {
        const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
        await updateDoc(docRef, { status });
        return { error: null };
    } catch (error) {
        return { error: error.message };
    }
};

// Cancel booking
export const cancelBooking = async (bookingId) => {
    return updateBookingStatus(bookingId, 'cancelled');
};

// Confirm booking
export const confirmBooking = async (bookingId) => {
    return updateBookingStatus(bookingId, 'confirmed');
};

// Complete booking
export const completeBooking = async (bookingId) => {
    return updateBookingStatus(bookingId, 'completed');
};

// Check if dates overlap with existing bookings
export const checkAvailability = async (vehicleId, startDate, endDate) => {
    try {
        const { bookings, error } = await getVehicleBookings(vehicleId);

        if (error) return { available: false, error };

        // Filter only confirmed or pending bookings
        const activeBookings = bookings.filter(
            b => b.status === 'confirmed' || b.status === 'pending'
        );

        // Check for overlaps
        const start = new Date(startDate);
        const end = new Date(endDate);

        for (const booking of activeBookings) {
            const bookingStart = booking.startDate.toDate ? booking.startDate.toDate() : new Date(booking.startDate);
            const bookingEnd = booking.endDate.toDate ? booking.endDate.toDate() : new Date(booking.endDate);

            // Check if dates overlap
            if (start <= bookingEnd && end >= bookingStart) {
                return { available: false, error: null };
            }
        }

        return { available: true, error: null };
    } catch (error) {
        return { available: false, error: error.message };
    }
};
