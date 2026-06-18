/**
 * PARISHVA BRANDING STUDIO — Firebase Configuration & Initialization
 * 
 * Replace the configuration values below with your specific Firebase Project parameters.
 * You can get these details from the Firebase Console (Settings -> Project Settings -> General -> Your Apps).
 */

const firebaseConfig = {
    apiKey: "AIzaSyD5UF4b7l9FdlPnViEhSlxbUkRQm-qoUtI",
    authDomain: "parishva-web.firebaseapp.com",
    projectId: "parishva-web",
    storageBucket: "parishva-web.firebasestorage.app",
    messagingSenderId: "880582253628",
    appId: "1:880582253628:web:564e91a40c16057cc3b739",
    databaseURL: "https://parishva-web-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase once config is set
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    window.db = firebase.database();
    window.auth = firebase.auth();
    console.log("Parishva Services: Firebase Client SDK (Realtime Database) initialized successfully.");
} else {
    console.error("Firebase SDK script not loaded. Verify your CDN scripts in index.html.");
}
