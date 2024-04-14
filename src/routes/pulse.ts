import express, { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import passport from 'passport';
import { ProfileService } from '../services/profile.service';

const router: Router = express.Router();

router.post(
    '/pulse',
    passport.authenticate('jwt', { session: false }),
    (request: Request, response: Response) => {
        response.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            profile: ProfileService.extract(request),
        });
    }
);

export default router;
