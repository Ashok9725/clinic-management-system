// Firebase configuration (replace with your project's config)
const firebaseConfig = {
  apiKey: "AIzaSyBeeij7MgDnXQ2TySUzBKSNiS9igErPLIo",
  authDomain: "clinic-management-system-92b29.firebaseapp.com",
  projectId: "clinic-management-system-92b29",
  storageBucket: "clinic-management-system-92b29.firebasestorage.app",
  messagingSenderId: "1047668845304",
  appId: "1:1047668845304:web:9e460ddbe0cfa51da2e90d",
  measurementId: "G-GY9HW6YRGC"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();