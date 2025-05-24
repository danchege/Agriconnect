import { 
    collection,
    query,
    where,
    orderBy,
    getDocs,
    addDoc,
    doc,
    updateDoc,
    deleteDoc,
    onSnapshot
} from "firebase/firestore";
import { db } from "./firebase-config.js";

// Get all market prices
export const getMarketPrices = async (filters = {}) => {
    try {
        let pricesQuery = collection(db, "prices");
        
        // Apply filters
        if (filters.product) {
            pricesQuery = query(pricesQuery, where("product", "==", filters.product));
        }
        if (filters.county) {
            pricesQuery = query(pricesQuery, where("county", "==", filters.county));
        }
        
        // Always order by date
        pricesQuery = query(pricesQuery, orderBy("date", "desc"));
        
        const snapshot = await getDocs(pricesQuery);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error getting market prices:", error);
        throw error;
    }
};

// Subscribe to real-time price updates
export const subscribeToPriceUpdates = (callback) => {
    const pricesQuery = query(
        collection(db, "prices"),
        orderBy("date", "desc")
    );
    
    return onSnapshot(pricesQuery, (snapshot) => {
        const prices = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(prices);
    });
};

// Create price alert
export const createPriceAlert = async (userId, alertData) => {
    try {
        const alertRef = await addDoc(collection(db, "alerts"), {
            userId,
            ...alertData,
            createdAt: new Date().toISOString(),
            active: true
        });
        return { success: true, alertId: alertRef.id };
    } catch (error) {
        console.error("Error creating price alert:", error);
        return { success: false, error: error.message };
    }
};

// Get user's price alerts
export const getUserAlerts = async (userId) => {
    try {
        const alertsQuery = query(
            collection(db, "alerts"),
            where("userId", "==", userId),
            where("active", "==", true)
        );
        
        const snapshot = await getDocs(alertsQuery);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error getting user alerts:", error);
        throw error;
    }
};

// Update price alert
export const updateAlert = async (alertId, updateData) => {
    try {
        await updateDoc(doc(db, "alerts", alertId), updateData);
        return { success: true };
    } catch (error) {
        console.error("Error updating alert:", error);
        return { success: false, error: error.message };
    }
};

// Delete price alert
export const deleteAlert = async (alertId) => {
    try {
        await deleteDoc(doc(db, "alerts", alertId));
        return { success: true };
    } catch (error) {
        console.error("Error deleting alert:", error);
        return { success: false, error: error.message };
    }
}; 