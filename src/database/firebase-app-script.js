import('firebase/auth');
import('firebase/database');
import('firebase/app').then((firebase) => {
    firebase.initializeApp({
        apiKey: "AIzaSyDJNIKGjZvtIQ8VIpIhUG0BiXi9pgf_BIs",
        authDomain: "firestore-app-36073.firebaseapp.com",
        databaseURL: "https://firestore-app-36073.firebaseio.com",
        projectId: "firestore-app-36073",
        storageBucket: "firestore-app-36073.appspot.com",
        messagingSenderId: "787798840162",
        appId: "1:787798840162:web:d61be2b5198e874ef1123b",
        measurementId: "G-W6PFPP1XFN"
    });
    window.firebase = firebase;
});
