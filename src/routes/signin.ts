import express, { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import passport from 'passport';
import {
    handleAuthentication,
    preventAuthentication,
} from '../middleware/authentication';
import { ProfileService } from '../services/profile.service';

const router: Router = express.Router();

router.post(
    '/signin',
    preventAuthentication,
    passport.authenticate('email-password', { session: false }),
    handleAuthentication,
    (request: Request, response: Response) => {
        response.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            profile: ProfileService.extract(request),
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
        response.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            profile: ProfileService.extract(request),
        });
    }
);

export default router;
