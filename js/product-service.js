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
    getDoc
} from "firebase/firestore";
import { 
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "firebase/storage";
import { db, storage } from "./firebase-config.js";

// Add new product listing
export const addProduct = async (farmerId, productData, imageFile) => {
    try {
        let imageUrl = null;
        
        // Upload image if provided
        if (imageFile) {
            const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
            const snapshot = await uploadBytes(storageRef, imageFile);
            imageUrl = await getDownloadURL(snapshot.ref);
        }

        // Create product document
        const productRef = await addDoc(collection(db, "products"), {
            farmerId,
            ...productData,
            imageUrl,
            datePosted: new Date().toISOString(),
            status: 'available'
        });

        return { success: true, productId: productRef.id };
    } catch (error) {
        console.error("Error adding product:", error);
        return { success: false, error: error.message };
    }
};

// Get all products with filters
export const getProducts = async (filters = {}) => {
    try {
        let productsQuery = collection(db, "products");
        
        if (filters.farmerId) {
            productsQuery = query(productsQuery, where("farmerId", "==", filters.farmerId));
        }
        if (filters.status) {
            productsQuery = query(productsQuery, where("status", "==", filters.status));
        }
        
        productsQuery = query(productsQuery, orderBy("datePosted", "desc"));
        
        const snapshot = await getDocs(productsQuery);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error getting products:", error);
        throw error;
    }
};

// Update product
export const updateProduct = async (productId, updateData, newImageFile) => {
    try {
        const productRef = doc(db, "products", productId);
        const product = await getDoc(productRef);
        
        if (!product.exists()) {
            throw new Error("Product not found");
        }

        let imageUrl = updateData.imageUrl;

        // Handle image update
        if (newImageFile) {
            // Delete old image if it exists
            if (product.data().imageUrl) {
                const oldImageRef = ref(storage, product.data().imageUrl);
                await deleteObject(oldImageRef);
            }

            // Upload new image
            const storageRef = ref(storage, `products/${Date.now()}_${newImageFile.name}`);
            const snapshot = await uploadBytes(storageRef, newImageFile);
            imageUrl = await getDownloadURL(snapshot.ref);
        }

        await updateDoc(productRef, {
            ...updateData,
            imageUrl,
            lastUpdated: new Date().toISOString()
        });

        return { success: true };
    } catch (error) {
        console.error("Error updating product:", error);
        return { success: false, error: error.message };
    }
};

// Delete product
export const deleteProduct = async (productId) => {
    try {
        const productRef = doc(db, "products", productId);
        const product = await getDoc(productRef);
        
        if (!product.exists()) {
            throw new Error("Product not found");
        }

        // Delete image if it exists
        if (product.data().imageUrl) {
            const imageRef = ref(storage, product.data().imageUrl);
            await deleteObject(imageRef);
        }

        await deleteDoc(productRef);
        return { success: true };
    } catch (error) {
        console.error("Error deleting product:", error);
        return { success: false, error: error.message };
    }
};

// Create chat between buyer and farmer
export const createChat = async (buyerId, farmerId, productId) => {
    try {
        const chatRef = await addDoc(collection(db, "chats"), {
            participants: [buyerId, farmerId],
            productId,
            createdAt: new Date().toISOString(),
            lastMessage: null,
            lastMessageTime: null
        });

        return { success: true, chatId: chatRef.id };
    } catch (error) {
        console.error("Error creating chat:", error);
        return { success: false, error: error.message };
    }
};

// Send message in chat
export const sendMessage = async (chatId, senderId, message) => {
    try {
        const messageRef = await addDoc(collection(db, `chats/${chatId}/messages`), {
            senderId,
            message,
            timestamp: new Date().toISOString()
        });

        // Update chat's last message
        await updateDoc(doc(db, "chats", chatId), {
            lastMessage: message,
            lastMessageTime: new Date().toISOString()
        });

        return { success: true, messageId: messageRef.id };
    } catch (error) {
        console.error("Error sending message:", error);
        return { success: false, error: error.message };
    }
};

// Get user's chats
export const getUserChats = async (userId) => {
    try {
        const chatsQuery = query(
            collection(db, "chats"),
            where("participants", "array-contains", userId),
            orderBy("lastMessageTime", "desc")
        );
        
        const snapshot = await getDocs(chatsQuery);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error getting user chats:", error);
        throw error;
    }
}; 