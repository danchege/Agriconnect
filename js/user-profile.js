import { db } from './firebase-config.js';
import { 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Create or update user profile
export async function saveUserProfile(userId, userData) {
    try {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, {
            ...userData,
            updatedAt: new Date(),
        }, { merge: true });
        return true;
    } catch (error) {
        console.error('Error saving user profile:', error);
        throw error;
    }
}

// Get user profile
export async function getUserProfile(userId) {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            return { id: userSnap.id, ...userSnap.data() };
        }
        return null;
    } catch (error) {
        console.error('Error getting user profile:', error);
        throw error;
    }
}

// Get user's products (for farmers)
export async function getFarmerProducts(userId) {
    try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where('farmerId', '==', userId));
        const querySnapshot = await getDocs(q);
        
        const products = [];
        querySnapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() });
        });
        
        return products;
    } catch (error) {
        console.error('Error getting farmer products:', error);
        throw error;
    }
}

// Get user's requests (for buyers)
export async function getBuyerRequests(userId) {
    try {
        const requestsRef = collection(db, 'contactRequests');
        const q = query(requestsRef, where('buyerId', '==', userId));
        const querySnapshot = await getDocs(q);
        
        const requests = [];
        querySnapshot.forEach((doc) => {
            requests.push({ id: doc.id, ...doc.data() });
        });
        
        return requests;
    } catch (error) {
        console.error('Error getting buyer requests:', error);
        throw error;
    }
}

// Update user settings
export async function updateUserSettings(userId, settings) {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            settings: settings,
            updatedAt: new Date()
        });
        return true;
    } catch (error) {
        console.error('Error updating user settings:', error);
        throw error;
    }
}

// Update user notification preferences
export async function updateNotificationPreferences(userId, preferences) {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            notificationPreferences: preferences,
            updatedAt: new Date()
        });
        return true;
    } catch (error) {
        console.error('Error updating notification preferences:', error);
        throw error;
    }
} 