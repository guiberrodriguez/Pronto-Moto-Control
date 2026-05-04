importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyC9cOBGzTfCSxRI4c9-PH8-9nGXGTX32V4",
  authDomain: "pronto-moto-control.firebaseapp.com",
  projectId: "pronto-moto-control",
  storageBucket: "pronto-moto-control.firebasestorage.app",
  messagingSenderId: "371130122184",
  appId: "1:371130122184:web:7dc67b1ec5d6603d418afd"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  self.registration.showNotification(payload.notification?.title || "Pronto Moto", {
    body: payload.notification?.body || "Nueva notificación"
  });
});
