import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { initialiseFirebase } from './utils/firebase';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

initialiseFirebase();

app.use(express.json());

app.listen(port, () => {
    console.log(`grace-authentication-api is available at http://localhost:${port}/`);
});