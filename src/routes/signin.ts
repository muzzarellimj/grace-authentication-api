import express, { Router } from 'express';
import passport from 'passport';
import { setAuthentication } from '../middleware/authentication';

const router: Router = express.Router();

router.post('/signin', passport.authenticate('email-password', { session: false }), setAuthentication);

export default router;
