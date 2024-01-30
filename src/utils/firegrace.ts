import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth, inMemoryPersistence } from 'firebase/auth';

export class Firegrace {
    core: FirebaseApp | undefined;
    authentication: Auth | undefined;

    configuration = {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID
    }

    constructor() {
        this.core = initializeApp(this.configuration);
        this.authentication = getAuth(this.core);
        this.authentication.setPersistence(inMemoryPersistence);
    }
}