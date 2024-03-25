import express, { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import passport from 'passport';

const router: Router = express.Router();

router.post('/pulse', passport.authenticate('jwt', { session: false }), (request: Request, response: Response) => {
    if (!request.user || !request.cookies.token) {
        return response.status(StatusCodes.UNAUTHORIZED).send();
    }

    response.status(StatusCodes.OK).send();
});

export default router;
