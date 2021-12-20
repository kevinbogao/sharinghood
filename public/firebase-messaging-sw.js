importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging.js");

firebase.initializeApp({
  // apiKey: "AIzaSyD5Qi78uPMJbZIdP4Xrso_Xgw_KkoUNIFc",
  // authDomain: "sharinghood-4fded.firebaseapp.com",
  // databaseURL: "https://sharinghood-4fded.firebaseio.com",
  // projectId: "sharinghood-4fded",
  // storageBucket: "sharinghood-4fded.appspot.com",
  // messagingSenderId: "908962399001",
  // appId: "1:908962399001:web:942e613c975dd1a86d7b88",

  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
});

const messaging = firebase.messaging();
