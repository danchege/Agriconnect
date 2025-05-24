import { auth, db } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Register new user
export async function registerUser(userData) {
    try {
        // Create authentication record
        const userCredential = await createUserWithEmailAndPassword(
            auth, 
            userData.email, 
            userData.password
        );

        // Create user profile in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
            userType: userData.userType, // 'seller' or 'buyer'
            name: userData.name,
            phone: userData.phone,
            email: userData.email,
            location: userData.location,
            createdAt: new Date(),
            // Additional fields for farmers
            ...(userData.userType === 'farmer' && {
                products: userData.products,
                farmLocation: userData.farmLocation
            }),
            // Additional fields for buyers
            ...(userData.userType === 'buyer' && {
                companyName: userData.companyName,
                buyerType: userData.buyerType,
                interestedProducts: userData.interestedProducts,
                transportAvailable: userData.transport
            })
        });

        return userCredential.user;
    } catch (error) {
        console.error('Error in registration:', error);
        throw error;
    }
}

// Login user
export async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error('Error in login:', error);
        throw error;
    }
}

// Logout user
export async function logoutUser() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Error in logout:', error);
        throw error;
    }
}

// Get current user
export function getCurrentUser() {
    return auth.currentUser;
}

// Listen to auth state changes
export function onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
}

// Update user profile
export async function updateUserProfile(userId, updateData) {
    try {
        await setDoc(doc(db, 'users', userId), updateData, { merge: true });
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
} 