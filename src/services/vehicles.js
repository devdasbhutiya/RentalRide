import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';

const VEHICLES_COLLECTION = 'vehicles';

// Upload images to Firebase Storage
export const uploadImages = async (files, vehicleId) => {
    const urls = [];

    for (const file of files) {
        const storageRef = ref(storage, `vehicles/${vehicleId}/${file.name}-${Date.now()}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        urls.push(url);
    }

    return urls;
};

// Add new vehicle
export const addVehicle = async (vehicleData, imageFiles, userId, userName) => {
    try {
        // First create the document to get an ID
        const docRef = await addDoc(collection(db, VEHICLES_COLLECTION), {
            ...vehicleData,
            ownerId: userId,
            ownerName: userName,
            images: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        // Upload images if provided
        let imageUrls = [];
        if (imageFiles && imageFiles.length > 0) {
            imageUrls = await uploadImages(imageFiles, docRef.id);
            await updateDoc(docRef, { images: imageUrls });
        }

        return { id: docRef.id, error: null };
    } catch (error) {
        return { id: null, error: error.message };
    }
};

// Get all vehicles with optional filters
export const getVehicles = async (filters = {}) => {
    try {
        let q = collection(db, VEHICLES_COLLECTION);
        const constraints = [];

        if (filters.type && filters.type !== 'all') {
            constraints.push(where('type', '==', filters.type));
        }

        if (filters.available !== undefined) {
            constraints.push(where('available', '==', filters.available));
        }

        constraints.push(orderBy('createdAt', 'desc'));

        q = query(q, ...constraints);
        const querySnapshot = await getDocs(q);

        let vehicles = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Client-side filtering for price range and location
        if (filters.minPrice) {
            vehicles = vehicles.filter(v => v.pricePerDay >= filters.minPrice);
        }
        if (filters.maxPrice) {
            vehicles = vehicles.filter(v => v.pricePerDay <= filters.maxPrice);
        }
        if (filters.location) {
            vehicles = vehicles.filter(v =>
                v.location.toLowerCase().includes(filters.location.toLowerCase())
            );
        }

        return { vehicles, error: null };
    } catch (error) {
        return { vehicles: [], error: error.message };
    }
};

// Get single vehicle by ID
export const getVehicleById = async (vehicleId) => {
    try {
        const docRef = doc(db, VEHICLES_COLLECTION, vehicleId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { vehicle: { id: docSnap.id, ...docSnap.data() }, error: null };
        } else {
            return { vehicle: null, error: 'Vehicle not found' };
        }
    } catch (error) {
        return { vehicle: null, error: error.message };
    }
};

// Get vehicles by owner
export const getUserVehicles = async (userId) => {
    try {
        const q = query(
            collection(db, VEHICLES_COLLECTION),
            where('ownerId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const vehicles = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return { vehicles, error: null };
    } catch (error) {
        return { vehicles: [], error: error.message };
    }
};

// Update vehicle
export const updateVehicle = async (vehicleId, data, newImageFiles = []) => {
    try {
        const docRef = doc(db, VEHICLES_COLLECTION, vehicleId);

        // Upload new images if provided
        if (newImageFiles.length > 0) {
            const newImageUrls = await uploadImages(newImageFiles, vehicleId);
            data.images = [...(data.images || []), ...newImageUrls];
        }

        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp()
        });

        return { error: null };
    } catch (error) {
        return { error: error.message };
    }
};

// Delete vehicle
export const deleteVehicle = async (vehicleId) => {
    try {
        const docRef = doc(db, VEHICLES_COLLECTION, vehicleId);
        await deleteDoc(docRef);
        return { error: null };
    } catch (error) {
        return { error: error.message };
    }
};

// Toggle vehicle availability
export const toggleVehicleAvailability = async (vehicleId, available) => {
    try {
        const docRef = doc(db, VEHICLES_COLLECTION, vehicleId);
        await updateDoc(docRef, {
            available: available,
            updatedAt: serverTimestamp()
        });
        return { error: null };
    } catch (error) {
        return { error: error.message };
    }
};
