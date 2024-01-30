import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { createUser, signinUser, signoutUser } from './example/email-password';
import { Firegrace } from './utils/firegrace';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const firegrace = new Firegrace();

app.use(express.json());

app.post('/api/ex/auth/create', async (req: Request, res: Response) => {
    const email: string = req.body.email || '';
    const password: string = req.body.password || '';

    const response = await createUser(firegrace.authentication!, email, password);

    res.status(response.code).send(response.message);
});

app.post('/api/ex/auth/in', async (req: Request, res: Response) => {
    const email: string = req.body.email || '';
    const password: string = req.body.password || '';

    const response = await signinUser(firegrace.authentication!, email, password);

    res.status(response.code).send(response.message);
});

app.post('/api/ex/auth/out', async (req: Request, res: Response) => {
    await signinUser(firegrace.authentication!, 'foo@bar.com', 'password');
    await signoutUser(firegrace.authentication!);

    res.status(200).send();
});

app.listen(port, () => {
    console.log(`[server] grace-authentication-api is available at http://localhost:${port}/`);
});