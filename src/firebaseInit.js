import { initializeApp } from 'firebase/app';
import { getMessaging, onMessage } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: "AIzaSyANXlQahWUVoeNVU7FWefl5Lr5vwoGjmEk",
    authDomain: "smartwatch-fc7cc.firebaseapp.com",
    projectId: "smartwatch-fc7cc",
    storageBucket: "smartwatch-fc7cc.firebasestorage.app",
    messagingSenderId: "404258235404",
    appId: "1:404258235404:web:bcb7daa1d0df2b8e03fa29"
  };
  
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onMessage(messaging, (payload) => {
  console.log('Message received in foreground:', payload);
  // You can update your UI to display a notification or pop-up message
});

export { messaging };