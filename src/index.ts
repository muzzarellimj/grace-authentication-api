import express, { Express } from "express";
import dotenv from "dotenv";
import { initializeApp } from "firebase/app";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

initializeApp({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
});

app.use(express.json());

app.listen(port, () => {
    console.log(
        `grace-authentication-api is available at http://localhost:${port}/`
    );
});
