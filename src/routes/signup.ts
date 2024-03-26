import bcrypt from 'bcrypt';
import express, { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { DEFAULT_SALT_ROUND_COUNT } from '../constants';
import { validateUserCreationArgs } from '../middleware/validation';
import { FirestorePath, FirestoreService } from '../services/firestore.service';

const router: Router = express.Router();

router.post('/signup', validateUserCreationArgs, async (request: Request, response: Response) => {
    const { email, password, firstName, lastName } = request.body;

    const existingUser = await FirestoreService.findOne(FirestorePath.USER, 'email', '==', email.toLowerCase());

    if (existingUser) {
        return response
            .status(StatusCodes.BAD_REQUEST)
            .json({ message: 'A user account already exists with this email address.' });
    }

    bcrypt.hash(password, DEFAULT_SALT_ROUND_COUNT, async (error: Error | undefined, hash: string) => {
        if (error) {
            return response
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ message: 'Oops! We hit a snag. Please try again later.' });
        }

        await FirestoreService.storeOne(FirestorePath.USER, {
            email: email.toLowerCase(),
            password: hash,
            firstName: firstName,
            lastName: lastName,
        });
    });

    response.status(StatusCodes.CREATED).json({ message: 'Your user account has been created. Welcome to Grace!' });
});

export default router;
