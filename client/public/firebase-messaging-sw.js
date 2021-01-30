importScripts("https://www.gstatic.com/firebasejs/7.15.0/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/7.15.0/firebase-messaging.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyD5Qi78uPMJbZIdP4Xrso_Xgw_KkoUNIFc",
  authDomain: "sharinghood-4fded.firebaseapp.com",
  databaseURL: "https://sharinghood-4fded.firebaseio.com",
  projectId: "sharinghood-4fded",
  storageBucket: "sharinghood-4fded.appspot.com",
  messagingSenderId: "908962399001",
  appId: "1:908962399001:web:942e613c975dd1a86d7b88",
});

const messaging = firebase.messaging();
