import bcrypt from 'bcrypt';
import passport from 'passport-local';
import { FirestorePath, FirestoreService } from '../services/firestore.service';
import { LoggingService } from '../services/logging.service';
import { ValidationService } from '../services/validation.service';

const cls: string = 'email-password';

const LocalStrategy = passport.Strategy;

const emailPasswordStrategy = new LocalStrategy(
    { usernameField: 'email' },
    async (
        email: string,
        password: string,
        done: (error: any, user?: false | Express.User | undefined) => void
    ) => {
        const fn: string = 'emailPasswordStrategy';

        LoggingService.debug({
            cls: cls,
            fn: fn,
            message:
                'Authenticating with Passport local email and password strategy...',
            data: {
                email: email,
            },
        });

        const isEmailValid = ValidationService.validateEmailAddress(email);

        if (!isEmailValid) {
            LoggingService.debug({
                cls: cls,
                fn: fn,
                message:
                    'Authentication with local email and password strategy failure; email is invalid.',
                data: {
                    email: email,
                },
            });

            return done(null, false);
        }

        const user = await FirestoreService.findOne(
            FirestorePath.USER,
            'email',
            '==',
            email.toLowerCase()
        );

        if (!user) {
            LoggingService.debug({
                cls: cls,
                fn: fn,
                message:
                    'Authentication with local email and password strategy failure; email does not exist.',
                data: {
                    email: email,
                },
            });

            return done(null, false);
        }

        bcrypt.compare(password, user.password, (error, match) => {
            if (error) {
                LoggingService.error({
                    cls: cls,
                    fn: fn,
                    message:
                        'Authentication with local email and password strategy failure; bcrypt.compare experienced an error.',
                    data: {
                        email: email,
                        error: {
                            name: error.name,
                            message: error.message,
                            stack: error.stack,
                        },
                    },
                });

                return done(error, false);
            }

            if (!match) {
                LoggingService.debug({
                    cls: cls,
                    fn: fn,
                    message:
                        'Authentication with local email and password strategy failure; provided password does not match stored password.',
                    data: {
                        email: email,
                    },
                });

                return done(null, false);
            }

            LoggingService.debug({
                cls: cls,
                fn: fn,
                message:
                    'Authentication with local email and password strategy success.',
                data: {
                    email: email,
                },
            });

            done(null, user);
        });
    }
);

export default emailPasswordStrategy;
