import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Role, Status, User } from '../models/user';
import { LoggingService } from '../services/logging.service';

const cls: string = 'authorization.middleware';

export function isAdministrator(
    request: Request,
    response: Response,
    next: NextFunction
) {
    const fn: string = 'isAdministrator';

    const user: User | undefined = request.user as User;

    if (!user || !user.email) {
        LoggingService.error({
            cls: cls,
            fn: fn,
            message:
                'Passport authentication success but could not extract user credentials in request.',
        });

        return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: 'Oops! We hit a snag. Please try again.',
        });
    }

    LoggingService.debug({
        cls: cls,
        fn: fn,
        message: 'Determining that authenticated user is an administrator...',
        data: {
            id: user.id,
        },
    });

    if (user.role != Role.ADMINISTRATOR || user.status != Status.ACTIVE) {
        LoggingService.error({
            cls: cls,
            fn: fn,
            message:
                'Authenticated user is either not an administrator or is restricted.',
            data: {
                id: user.id,
                email: user.email,
                role: user.role,
                status: user.status,
            },
        });

        return response.status(StatusCodes.FORBIDDEN).json({
            status: StatusCodes.FORBIDDEN,
            message:
                "Oops! You don't have access to this resource. Contact an administrator if this seems incorrect.",
        });
    }

    LoggingService.debug({
        cls: cls,
        fn: fn,
        message:
            'Authenticated user is an administrator and is active; proceeding to next function.',
        data: {
            id: user.id,
        },
    });

    next();
}
