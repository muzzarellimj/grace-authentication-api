import express, { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import passport from 'passport';
import { handleDeauthentication } from '../middleware/authentication';
import { LoggingService } from '../services/logging.service';

const router: Router = express.Router();

router.post(
    '/signout',
    passport.authenticate('jwt', { session: false }),
    handleDeauthentication,
    (_: Request, response: Response) => {
        LoggingService.debug({
            cls: 'signout',
            fn: '/api/signout',
            message: 'Sign-out success.',
        });

        response.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
        });
    }
);

export default router;
