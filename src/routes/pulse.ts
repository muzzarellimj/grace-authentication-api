import express, { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import passport from 'passport';
import { Profile } from '../models/user';
import { LoggingService } from '../services/logging.service';
import { ProfileService } from '../services/profile.service';

const cls: string = 'pulse';

const router: Router = express.Router();

router.post(
    '/pulse',
    passport.authenticate('jwt', { session: false }),
    (request: Request, response: Response) => {
        const fn: string = '/api/pulse';

        LoggingService.debug({
            cls: cls,
            fn: fn,
            message: 'Authentication pulse success; extracting profile...',
        });

        const profile: Profile | undefined = ProfileService.extract(request);

        if (!profile) {
            LoggingService.error({
                cls: cls,
                fn: fn,
                message:
                    'Authentication pulse success but profile could not be extracted.',
                data: {
                    id: request.cookies.id,
                    token: request.cookies.token,
                },
            });

            return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                status: StatusCodes.INTERNAL_SERVER_ERROR,
                message: 'Oops! We hit a snag. Please try again later.',
            });
        }

        LoggingService.debug({
            cls: cls,
            fn: fn,
            message: 'Authentication pulse and profile extraction success.',
            data: {
                id: request.cookies.id,
                token: request.cookies.token,
            },
        });

        response.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            profile: profile,
        });
    }
);

export default router;
