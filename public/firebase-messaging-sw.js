importScripts("https://www.gstatic.com/firebasejs/8.2.5/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.5/firebase-messaging.js");

firebase.initializeApp({
  apiKey: "AIzaSyAHYmlwfITzo7-F-ubw3Y9oQjtZQ-vah8w",
  authDomain: "sharinghood-testing.firebaseapp.com",
  databaseURL: "https://sharinghood-testing.firebaseio.com",
  projectId: "sharinghood-testing",
  storageBucket: "sharinghood-testing.appspot.com",
  messagingSenderId: "103410129857",
  appId: "1:103410129857:web:52e44f3b1c9e1213e6ed40",
});

const messaging = firebase.messaging();
