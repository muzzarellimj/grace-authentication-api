import express, { Express } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`[server] grace-authentication-api is available at http://localhost:${port}/`);
});