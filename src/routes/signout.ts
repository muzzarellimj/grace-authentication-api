import express, { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import passport from 'passport';
import { handleDeauthentication } from '../middleware/authentication';

const router: Router = express.Router();

router.post(
    '/signout',
    passport.authenticate('jwt', { session: false }),
    handleDeauthentication,
    (_: Request, response: Response) => {
        response.status(StatusCodes.OK).send();
    }
);

export default router;
