import express, { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import passport from 'passport';
import { validateUserUpdateArgs } from '../middleware/validation.middleware';
import { User } from '../models/user';
import { FirestorePath, FirestoreService } from '../services/firestore.service';
import { LoggingService } from '../services/logging.service';
import { encrypt } from '../utils/password.util';

const cls: string = 'update.route';

const router: Router = express.Router();

router.post(
    '/update',
    validateUserUpdateArgs,
    passport.authenticate('jwt', { session: false }),
    async (request: Request, response: Response) => {
        const fn: string = '/api/update';

        LoggingService.debug({
            cls: cls,
            fn: fn,
            message: 'Authentication success; updating profile...',
        });

        const user: User | undefined = request.user;

        if (!user || !user.email) {
            LoggingService.error({
                cls: cls,
                fn: fn,
                message:
                    'Unable to update user; user credentials could not be parsed in request...',
            });

            return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                status: StatusCodes.INTERNAL_SERVER_ERROR,
                message: 'Oops! We hit a snag. Please try again later.',
            });
        }

        let data: any = {};

        data = processPasswordArg(request, data);
        data = processEmailArg(request, data);
        data = processNameArg('firstName', request, data);
        data = processNameArg('lastName', request, data);

        if (data.email) {
            const emailMatches: boolean =
                user.email.toLowerCase() == data.email.toLowerCase();

            if (emailMatches) {
                return response.status(StatusCodes.BAD_REQUEST).json({
                    status: StatusCodes.BAD_REQUEST,
                    message: 'You are already using this email address.',
                });
            }

            const emailExists: User | null = await FirestoreService.findOne(
                FirestorePath.USER,
                'email',
                '==',
                data.email
            );

            if (emailExists && emailExists.email == data.email) {
                return response.status(StatusCodes.BAD_REQUEST).json({
                    status: StatusCodes.BAD_REQUEST,
                    message: 'A user already exists with this email address.',
                });
            }
        }

        const isUpdated = await FirestoreService.updateOne(
            FirestorePath.USER,
            'id',
            '==',
            user.id,
            data
        );

        if (!isUpdated) {
            return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                status: StatusCodes.INTERNAL_SERVER_ERROR,
                message: 'Oops! We hit a snag. Please try again later.',
            });
        }

        response.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            message: 'Your user profile has been updated.',
        });
    }
);

function processPasswordArg(request: Request, data: any): any {
    const fn: string = 'processPasswordArg';

    const passwordArg: string | undefined = request.body.password;

    if (!passwordArg || passwordArg.length == 0) {
        LoggingService.debug({
            cls: cls,
            fn: fn,
            message:
                'Password argument is empty; data object has not been manipulated.',
        });

        return data;
    }

    const hash: string | undefined = encrypt(passwordArg);

    if (!hash || hash.length == 0) {
        LoggingService.debug({
            cls: cls,
            fn: fn,
            message:
                'Generated password hash is empty; data object has not been manipulated.',
        });

        return data;
    }

    LoggingService.debug({
        cls: cls,
        fn: fn,
        message:
            'Password hash generated; data object has been manipulated to include password.',
    });

    data.password = hash;

    return data;
}

function processEmailArg(request: Request, data: any): any {
    const fn: string = 'processEmailArg';

    const emailArg: string | undefined = request.body.email;

    if (!emailArg || emailArg.length == 0) {
        LoggingService.debug({
            cls: cls,
            fn: fn,
            message:
                'Email argument is empty; data object has not been manipulated.',
        });

        return data;
    }

    LoggingService.debug({
        cls: cls,
        fn: fn,
        message:
            'Email is valid; data object has been manipulated to include email.',
    });

    data.email = emailArg.toLowerCase();

    return data;
}

function processNameArg(argument: string, request: Request, data: any) {
    const fn: string = 'processNameArg';

    const nameArg: string | undefined = request.body[argument];

    if (!nameArg || nameArg.length == 0) {
        LoggingService.debug({
            cls: cls,
            fn: fn,
            message:
                'Name argument is empty; data object has not been manipulated.',
        });

        return data;
    }

    LoggingService.debug({
        cls: cls,
        fn: fn,
        message:
            'Name argument is valid; data object has been manipulated to include name.',
    });

    data[argument] = nameArg;

    return data;
}

export default router;
