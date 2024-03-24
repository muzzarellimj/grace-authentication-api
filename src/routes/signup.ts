import bcrypt from 'bcrypt';
import express, { Request, Response, Router } from 'express';
import { DEFAULT_SALT_ROUND_COUNT } from '../constants';
import { FirestorePath, FirestoreService } from '../services/firestore.service';

const router: Router = express.Router();

router.post('/signup', async (request: Request, response: Response) => {
    const { email, password, firstName, lastName } = request.body;

    if (!/^\S+@\S+\.\S+$/.test(email)) {
        return response.status(400).json({ message: 'Please provide a valid email address.' });
    }

    if (!password) {
        return response.status(400).json({ message: 'Please provide a valid password.' });
    }

    if (!firstName || !lastName) {
        return response.status(400).json({ message: 'Please provide a valid first and last.' });
    }

    const existingUser = await FirestoreService.findOne(FirestorePath.USER, 'email', '==', email.toLowerCase());

    if (existingUser) {
        return response.status(400).json({ message: 'An account with this email address already exists.' });
    }

    bcrypt.hash(password, DEFAULT_SALT_ROUND_COUNT, async (error: Error | undefined, hash: string) => {
        if (error) {
            return response.status(500).json({ message: 'We hit a snag - please try again later.' });
        }

        await FirestoreService.storeOne(FirestorePath.USER, {
            email: email,
            password: hash,
            firstName: firstName,
            lastName: lastName,
        });

        return response.status(201).json({ message: 'Success! Your profile has been created. Welcome to Grace!' });
    });
});

export default router;
