import 'dotenv/config';

import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Express } from 'express';
import { initializeApp } from 'firebase/app';
import passport from 'passport';
import pulseRouter from './routes/pulse.route';
import signinRouter from './routes/signin.route';
import signoutRouter from './routes/signout.route';
import signupRouter from './routes/signup.route';
import updateRouter from './routes/update.route';
import { LoggingService } from './services/logging.service';
import emailPasswordStrategy from './strategies/email-password';
import googleOAuthStrategy from './strategies/google-oauth';
import jwtStrategy from './strategies/jwt';

LoggingService.init();

const app: Express = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

passport.use('email-password', emailPasswordStrategy);
passport.use('jwt', jwtStrategy);
passport.use('google-oauth', googleOAuthStrategy);

app.use('/api', pulseRouter);
app.use('/api', signupRouter);
app.use('/api', signinRouter);
app.use('/api', signoutRouter);
app.use('/api', updateRouter);

initializeApp({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
});

export default app;
