import express, { Request, Response, Router } from 'express';
import { DocumentData } from 'firebase/firestore';
import { StatusCodes } from 'http-status-codes';
import passport from 'passport';
import { isAdministrator } from '../middleware/authorization.middleware';
import { validateUserUpdateArgs } from '../middleware/validation.middleware';
import { User } from '../models/user';
import { FirestorePath, FirestoreService } from '../services/firestore.service';
import { LoggingService } from '../services/logging.service';
import {
    processEmailArg,
    processNameArg,
    processPasswordArg,
    processRoleArg,
    processStatusArg,
} from '../utils/argument.util';

const cls: string = 'administration.route';

const router: Router = express();

router.get(
    '/administration/user',
    passport.authenticate('jwt', { session: false }),
    isAdministrator,
    async (request: Request, response: Response) => {
        const fn: string = '/api/administration/user';

        const administrator: User | undefined = request.user as User;

        if (!administrator || !administrator.email) {
            LoggingService.error({
                cls: cls,
                fn: fn,
                message:
                    'Unable to retrieve user set; administrator credentials could not be parsed in request.',
            });

            return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                status: StatusCodes.INTERNAL_SERVER_ERROR,
                message: 'Oops! We hit a snag. Please try again.',
            });
        }

        LoggingService.debug({
            cls: cls,
            fn: fn,
            message: 'Retrieving all available user records...',
        });

        const documents: DocumentData[] | null = await FirestoreService.findAll(
            FirestorePath.USER
        );

        if (!documents || documents.length == 0) {
            LoggingService.warn({
                cls: cls,
                fn: fn,
                message:
                    'Unable to retrieve user set; document set was either null or empty',
            });

            return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                status: StatusCodes.INTERNAL_SERVER_ERROR,
                message: 'Oops! We hit a snag. Please try again.',
            });
        }

        documents.map((document: DocumentData) => {
            delete document.password;
        });

        LoggingService.debug({
            cls: cls,
            fn: fn,
            message: 'Retrieved all available user records with success.',
        });

        return response.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            data: documents,
        });
    }
);

router.post(
    '/administration/update',
    validateUserUpdateArgs,
    passport.authenticate('jwt', { session: false }),
    isAdministrator,
    async (request: Request, response: Response) => {
        const fn: string = '/api/administration';

        const administrator: User | undefined = request.user as User;

        if (!administrator || !administrator.email) {
            LoggingService.error({
                cls: cls,
                fn: fn,
                message:
                    'Unable to update user; administrator credentials could not be parsed in request.',
            });

            return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                status: StatusCodes.INTERNAL_SERVER_ERROR,
                message: 'Oops! We hit a snag. Please try again.',
            });
        }

        const userIdArg: string | undefined = request.body.id;

        if (!userIdArg || userIdArg.length == 0) {
            LoggingService.error({
                cls: cls,
                fn: fn,
                message:
                    'Unable to update user; user identifier could not be parsed in request.',
                data: {
                    administrator: administrator.id,
                    user: request.body.id,
                },
            });

            return response.status(StatusCodes.BAD_REQUEST).json({
                status: StatusCodes.BAD_REQUEST,
                message: 'Please provide a valid user identifier.',
            });
        }

        let data: any = {};

        data = processPasswordArg(request, data);
        data = processEmailArg(request, data);
        data = processNameArg('firstName', request, data);
        data = processNameArg('lastName', request, data);
        data = processRoleArg(request, data);
        data = processStatusArg(request, data);

        const isUpdated: boolean = await FirestoreService.updateOne(
            FirestorePath.USER,
            'id',
            '==',
            userIdArg,
            data
        );

        if (!isUpdated) {
            LoggingService.error({
                cls: cls,
                fn: fn,
                message:
                    'Unable to update user; could not find a matching record to update in database.',
                data: {
                    administrator: administrator.id,
                    user: userIdArg,
                },
            });

            return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                status: StatusCodes.INTERNAL_SERVER_ERROR,
                message:
                    'Unable to find a user matching the provided identifier.',
            });
        }

        LoggingService.debug({
            cls: cls,
            fn: fn,
            message:
                'Authorization and argument validation success; updating user.',
        });

        return response.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
        });
    }
);

export default router;
