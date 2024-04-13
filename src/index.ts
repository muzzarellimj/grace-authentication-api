require('dotenv').config(); // eslint-disable-line @typescript-eslint/no-var-requires

import cookieParser from 'cookie-parser';
import express, { Express } from 'express';
import { initializeApp } from 'firebase/app';
import passport from 'passport';
import pulseRouter from './routes/pulse';
import signinRouter from './routes/signin';
import signoutRouter from './routes/signout';
import signupRouter from './routes/signup';
import emailPasswordStrategy from './strategies/email-password';
import jwtStrategy from './strategies/jwt';

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
app.use(cookieParser());

passport.use('email-password', emailPasswordStrategy);
passport.use('jwt', jwtStrategy);

app.use('/api/authentication', pulseRouter);
app.use('/api/authentication', signupRouter);
app.use('/api/authentication', signinRouter);
app.use('/api/authentication', signoutRouter);

app.listen(port, () => {
    console.log(
        `grace-authentication-api is available at http://localhost:${port}/`
    );
});
