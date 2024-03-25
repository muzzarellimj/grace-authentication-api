import express, { Router } from 'express';
import passport from 'passport';
import { clearAuthentication } from '../middleware/authentication';

const router: Router = express.Router();

router.post('/signout', passport.authenticate('jwt', { session: false }), clearAuthentication);

export default router;
