import express, { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import passport from 'passport';
import { validateUserUpdateArgs } from '../middleware/validation.middleware';
import { User } from '../models/user';
import { FirestorePath, FirestoreService } from '../services/firestore.service';
import { LoggingService } from '../services/logging.service';
import {
    processEmailArg,
    processNameArg,
    processPasswordArg,
} from '../utils/argument.util';

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

        const user: User | undefined = request.user as User;

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

            const emailExists: User | null = (await FirestoreService.findOne(
                FirestorePath.USER,
                'email',
                '==',
                data.email
            )) as User;

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
        });
    }
);

export default router;
