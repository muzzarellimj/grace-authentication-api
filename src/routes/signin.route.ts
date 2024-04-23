import express, { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import passport from 'passport';
import {
    handleAuthentication,
    preventAuthentication,
} from '../middleware/authentication.middleware';
import { Profile, User } from '../models/user';
import { LoggingService } from '../services/logging.service';
import { ProfileService } from '../services/profile.service';

const cls: string = 'signin';

const router: Router = express.Router();

router.post(
    '/signin',
    preventAuthentication,
    passport.authenticate('email-password', { session: false }),
    handleAuthentication,
    (request: Request, response: Response) => {
        const fn: string = '/api/signin';

        LoggingService.debug({
            cls: cls,
            fn: fn,
            message:
                'Sign-in with email and password success; extracting profile...',
        });

        const profile: Profile | undefined = ProfileService.extract(request);

        if (!profile) {
            LoggingService.error({
                cls: cls,
                fn: fn,
                message:
                    'Sign-in with email and password success but profile could not be extracted.',
                data: {
                    token: response.locals.token,
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
            message:
                'Sign-in with email and passsword and profile extraction success.',
            data: {
                id: (request.user as User).id,
                token: response.locals.token,
            },
        });

        response.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            profile: profile,
            token: response.locals.token,
        });
    }
);

router.get(
    '/signin/google',
    preventAuthentication,
    passport.authenticate('google-oauth', { session: false })
);

router.get(
    '/signin/google/reroute',
    preventAuthentication,
    passport.authenticate('google-oauth', {
        session: false,
    }),
    handleAuthentication,
    (request: Request, response: Response) => {
        const fn: string = '/api/signin/google/reroute';

        LoggingService.debug({
            cls: cls,
            fn: fn,
            message: 'Sign-in with Google success; extracting profile...',
        });

        const profile: Profile | undefined = ProfileService.extract(request);

        if (!profile) {
            LoggingService.error({
                cls: cls,
                fn: fn,
                message:
                    'Sign-in with Google success but profile could not be extracted.',
                data: {
                    token: response.locals.token,
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
            message: 'Sign-in with Google and profile extraction success.',
            data: {
                id: (request.user as User).id,
                token: response.locals.token,
            },
        });

        response.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            profile: profile,
            token: response.locals.token,
        });
    }
);

export default router;
