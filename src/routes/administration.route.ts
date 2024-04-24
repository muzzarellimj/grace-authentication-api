import express, { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import passport from 'passport';
import { validateUserUpdateArgs } from '../middleware/validation.middleware';
import { Role, Status, User } from '../models/user';
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

router.post(
    '/administration/update',
    validateUserUpdateArgs,
    passport.authenticate('jwt', { session: false }),
    async (request: Request, response: Response) => {
        const fn: string = '/api/administration';

        LoggingService.debug({
            cls: cls,
            fn: fn,
            message: 'Authentication success; checking authorization...',
        });

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

        if (
            administrator.role != Role.ADMINISTRATOR ||
            administrator.status != Status.ACTIVE
        ) {
            LoggingService.error({
                cls: cls,
                fn: fn,
                message:
                    'Unable to update user; administrator is either unauthorized or restricted.',
                data: {
                    id: administrator.id,
                    email: administrator.email,
                    role: administrator.role,
                    status: administrator.status,
                },
            });

            return response.status(StatusCodes.FORBIDDEN).json({
                status: StatusCodes.FORBIDDEN,
                message:
                    "Oops! You don't have access to this resource. Contact an administrator if this seems incorrect.",
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
