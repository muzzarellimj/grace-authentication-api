import express, { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { preventAuthentication } from '../middleware/authentication.middleware';
import { validateUserCreationArgs } from '../middleware/validation.middleware';
import { Role, Status } from '../models/user';
import { FirestorePath, FirestoreService } from '../services/firestore.service';
import { LoggingService } from '../services/logging.service';
import { encrypt } from '../utils/password.util';

const cls: string = 'signup';

const router: Router = express.Router();

router.post(
    '/signup',
    preventAuthentication,
    validateUserCreationArgs,
    async (request: Request, response: Response) => {
        const fn: string = '/api/signup';

        const { email, password, firstName, lastName } = request.body;

        LoggingService.debug({
            cls: cls,
            fn: fn,
            message:
                'Email and password sign-up argument validation success; checking user existence...',
            data: {
                email: email,
            },
        });

        const existingUser = await FirestoreService.findOne(
            FirestorePath.USER,
            'email',
            '==',
            email.toLowerCase()
        );

        if (existingUser) {
            LoggingService.warn({
                cls: cls,
                fn: fn,
                message:
                    'Email and password sign-up failure; user with provided email exists.',
                data: {
                    email: email,
                },
            });

            return response.status(StatusCodes.BAD_REQUEST).json({
                status: StatusCodes.BAD_REQUEST,
                message:
                    'A user account already exists with this email address.',
            });
        }

        const hash: string | undefined = encrypt(password);

        if (!hash || hash.length == 0) {
            LoggingService.error({
                cls: cls,
                fn: fn,
                message:
                    'Email and password sign-up failure; error encounted while salting and hashing password.',
                data: {
                    email: email,
                },
            });

            return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                status: StatusCodes.INTERNAL_SERVER_ERROR,
                message: 'Oops! We hit a snag. Please try again later.',
            });
        }

        await FirestoreService.storeOne(FirestorePath.USER, {
            email: email.toLowerCase(),
            password: hash,
            firstName: firstName,
            lastName: lastName,
            role: Role.USER,
            status: Status.ACTIVE,
        });

        LoggingService.info({
            cls: cls,
            fn: fn,
            message:
                'Email and password sign-up success; user profile created and stored.',
            data: {
                email: email,
            },
        });

        response.status(StatusCodes.CREATED).json({
            status: StatusCodes.CREATED,
        });
    }
);

export default router;
