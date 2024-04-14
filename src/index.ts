import 'dotenv/config';

import cookieParser from 'cookie-parser';
import express, { Express } from 'express';
import { initializeApp } from 'firebase/app';
import passport from 'passport';
import pulseRouter from './routes/pulse';
import signinRouter from './routes/signin';
import signoutRouter from './routes/signout';
import signupRouter from './routes/signup';
import { LoggingService } from './services/logging.service';
import emailPasswordStrategy from './strategies/email-password';
import googleOAuthStrategy from './strategies/google-oauth';
import jwtStrategy from './strategies/jwt';

const app: Express = express();
const port = process.env.PORT || 3000;

LoggingService.init();

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
passport.use('google-oauth', googleOAuthStrategy);

app.use('/api', pulseRouter);
app.use('/api', signupRouter);
app.use('/api', signinRouter);
app.use('/api', signoutRouter);

app.listen(port, () => {
    LoggingService.info({
        source: 'express.App#listen',
        message: `Grace Authentication API is available at: http://localhost:${port}/`,
    });
});
