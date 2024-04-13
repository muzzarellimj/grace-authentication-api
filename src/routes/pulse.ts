import express, { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import passport from 'passport';

const router: Router = express.Router();

router.post(
    '/pulse',
    passport.authenticate('jwt', { session: false }),
    (_: Request, response: Response) => {
        response.status(StatusCodes.OK).send();
    }
);

export default router;
