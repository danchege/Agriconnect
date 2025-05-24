import { auth, db } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { saveUserProfile } from './user-profile.js';

// Register new user
export async function registerUser(userData) {
    try {
        // Create authentication user
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            userData.email,
            userData.password
        );

        // Update display name
        await updateProfile(userCredential.user, {
            displayName: userData.name
        });

        // Create user profile in Firestore
        const profileData = {
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            location: userData.location,
            userType: userData.userType,
            createdAt: new Date(),
            lastLogin: new Date()
        };

        // Add type-specific fields
        if (userData.userType === 'farmer') {
            profileData.products = userData.products;
            profileData.farmLocation = userData.farmLocation;
        } else {
            profileData.companyName = userData.companyName;
            profileData.buyerType = userData.buyerType;
            profileData.interestedProducts = userData.interestedProducts;
            profileData.transport = userData.transport;
        }

        // Save profile to Firestore
        await saveUserProfile(userCredential.user.uid, profileData);

        return userCredential.user;
    } catch (error) {
        console.error('Registration error:', error);
        
        // Provide user-friendly error messages
        switch (error.code) {
            case 'auth/email-already-in-use':
                throw new Error('This email is already registered. Please use a different email or try logging in.');
            case 'auth/invalid-email':
                throw new Error('Invalid email address. Please check and try again.');
            case 'auth/operation-not-allowed':
                throw new Error('Email/password accounts are not enabled. Please contact support.');
            case 'auth/weak-password':
                throw new Error('Password is too weak. Please use a stronger password with at least 6 characters.');
            default:
                throw new Error('Failed to create account. Please try again.');
        }
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