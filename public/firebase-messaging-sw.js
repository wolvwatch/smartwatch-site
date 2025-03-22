importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyANXlQahWUVoeNVU7FWefl5Lr5vwoGjmEk",
  authDomain: "smartwatch-fc7cc.firebaseapp.com",
  projectId: "smartwatch-fc7cc",
  storageBucket: "smartwatch-fc7cc.firebasestorage.app",
  messagingSenderId: "404258235404",
  appId: "1:404258235404:web:bcb7daa1d0df2b8e03fa29"
});


const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || 'Background Message Title';
  const notificationOptions = {
    body: payload.notification?.body || 'Background Message body.',
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});