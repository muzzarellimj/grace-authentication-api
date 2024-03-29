import express, { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import passport from 'passport';
import { disallowExistingAuthentication, handleAuthentication } from '../middleware/authentication';

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

export default router;
