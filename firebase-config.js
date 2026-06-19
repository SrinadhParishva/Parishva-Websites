/**
 * PARISHVA BRANDING STUDIO — Firebase Configuration & Initialization
 * 
 * Replace the configuration values below with your specific Firebase Project parameters.
 * You can get these details from the Firebase Console (Settings -> Project Settings -> General -> Your Apps).
 */

// Google Analytics 4 (GA4) Configuration
const GA_MEASUREMENT_ID = "G-Q68TTHJ6W7"; // Replace with your actual GA4 Measurement ID when deploying

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

// ── Google Analytics 4 (GA4) Dynamic Script Injection ──
window.dataLayer = window.dataLayer || [];
window.gtag = function() { window.dataLayer.push(arguments); };
window.gtag('js', new Date());

if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== "G-XXXXXXXXXX" && GA_MEASUREMENT_ID.startsWith('G-')) {
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(gaScript);
    window.gtag('config', GA_MEASUREMENT_ID);
    console.log(`[Google Analytics] Dynamic script injected successfully for ID: ${GA_MEASUREMENT_ID}`);
} else {
    window.gtag('config', 'G-XXXXXXXXXX');
    console.log("[Google Analytics] Measurement ID is set to placeholder (G-XXXXXXXXXX). Event tracking is active via window.dataLayer.");
}

