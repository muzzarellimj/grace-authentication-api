import { FirebaseOptions, initializeApp } from "firebase/app"

const configuration: FirebaseOptions = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
}

export function initialiseFirebase() {
    console.log('grace-authentication-api server connection established with Firebase');

    initializeApp(configuration);
}