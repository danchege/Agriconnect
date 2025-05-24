import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase-config.js";

// Register a new user
export const registerUser = async (email, password, name, phone, userType) => {
    try {
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update user profile with display name
        await updateProfile(user, {
            displayName: name
        });

        // Create user document in Firestore
        await setDoc(doc(db, "users", user.uid), {
            name,
            email,
            phone,
            userType,
            createdAt: new Date().toISOString(),
            county: "",
            specific_location: "",
            products: []
        });

        return { success: true, user };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Login user
export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Logout user
export const logoutUser = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Reset password
export const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Check if user is logged in
export const onAuthStateChanged = (callback) => {
    return auth.onAuthStateChanged(callback);
}; 