importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyDEMRFDhpvIU9--ZJ8SDXsFV0R6KkKKrLY",
  authDomain: "campusflow-c415d.firebaseapp.com",
  projectId: "campusflow-c415d",
  storageBucket: "campusflow-c415d.firebasestorage.app",
  messagingSenderId: "304872852414",
  appId: "1:304872852414:web:8d9736ead9d011003507ef",
  measurementId: "G-EGC0NCXY5W"
});

const messaging =
  firebase.messaging();

messaging.onBackgroundMessage(
  (payload) => {
    self.registration.showNotification(
      payload.notification.title,
      {
        body:
          payload.notification.body,
        icon: "/favicon.png",
      }
    );
  }
);