// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyADQXfDM6irt9DBc9kCsW9TCVfdqA0knXo",
    authDomain: "agriconnect-e8ef7.firebaseapp.com",
    databaseURL: "https://agriconnect-e8ef7-default-rtdb.firebaseio.com",
    projectId: "agriconnect-e8ef7",
    storageBucket: "agriconnect-e8ef7.firebasestorage.app",
    messagingSenderId: "115792949632",
    appId: "1:115792949632:web:3d1fbcd9532d229cf71165",
    measurementId: "G-1ZP0Z56LCT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { app, auth, db, storage, analytics }; 