import express, { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import passport from 'passport';
import {
    disallowExistingAuthentication,
    handleAuthentication,
} from '../middleware/authentication';

const router: Router = express.Router();

router.post(
    '/signin',
    disallowExistingAuthentication,
    passport.authenticate('email-password', { session: false }),
    handleAuthentication,
    (_: Request, response: Response) => {
        response.status(StatusCodes.OK).send();
    }
);

router.get(
    '/signin/google',
    disallowExistingAuthentication,
    passport.authenticate('google-oauth', { session: false })
);

router.get(
    '/signin/google/reroute',
    disallowExistingAuthentication,
    passport.authenticate('google-oauth', {
        session: false,
    }),
    handleAuthentication,
    (_: Request, response: Response) => {
        response.status(StatusCodes.OK).send();
    }
);

export default router;
