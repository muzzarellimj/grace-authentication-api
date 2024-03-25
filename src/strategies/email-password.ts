import bcrypt from 'bcrypt';
import passport from 'passport-local';
import { FirestorePath, FirestoreService } from '../services/firestore.service';
import { ValidationService } from '../services/validation.service';

const LocalStrategy = passport.Strategy;

const emailPasswordStrategy = new LocalStrategy(
    { usernameField: 'email' },
    async (email: string, password: string, done: (error: any, user?: false | Express.User | undefined) => void) => {
        const isEmailValid = ValidationService.validateEmailAddress(email);

        if (!isEmailValid) {
            return done(null, false);
        }

        const matchingUser = await FirestoreService.findOne(FirestorePath.USER, 'email', '==', email.toLowerCase());

        if (!matchingUser) {
            return done(null, false);
        }

        bcrypt.compare(password, matchingUser.password, (error, match) => {
            if (error) {
                return done(error, false);
            }

            if (!match) {
                return done(null, false);
            }

            done(null, matchingUser);
        });
    }
);

export default emailPasswordStrategy;
