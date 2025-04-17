import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { getMessaging, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyANXlQahWUVoeNVU7FWefl5Lr5vwoGjmEk",
  authDomain: "smartwatch-fc7cc.firebaseapp.com",
  projectId: "smartwatch-fc7cc",
  storageBucket: "smartwatch-fc7cc.firebasestorage.app",
  messagingSenderId: "404258235404",
  appId: "1:404258235404:web:d3c2bb99ccef68d803fa29"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const messaging = getMessaging(app);

onMessage(messaging, (payload) => {
  console.log('Message received in foreground:', payload);
  // You can update your UI to display a notification or pop-up message
});

// Function to store sensor data
export const storeSensorData = async (data) => {
    try {
        const docRef = await addDoc(collection(db, "sensorData"), {
            ...data,
            timestamp: new Date()
        });
        console.log("Document written with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw e;
    }
};

// Function to get all sensor data
export const getAllSensorData = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'sensorData'));
        const data = [];
        querySnapshot.forEach((doc) => {
            data.push({
                id: doc.id, // This will be the timestamp
                ...doc.data()
            });
        });
        return data;
    } catch (error) {
        console.error('Error getting sensor data:', error);
        return [];
    }
};

// Function to delete all sensor data
export const deleteAllSensorData = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "sensorData"));
        const deletePromises = querySnapshot.docs.map(doc => 
            deleteDoc(doc.ref)
        );
        await Promise.all(deletePromises);
        console.log("All documents deleted successfully");
    } catch (e) {
        console.error("Error deleting documents: ", e);
        throw e;
    }
};

export { db, messaging };