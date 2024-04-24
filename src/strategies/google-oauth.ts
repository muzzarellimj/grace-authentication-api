import passport, {
    Profile,
    StrategyOptions,
    VerifyCallback,
} from 'passport-google-oauth20';
import { Role, Status } from '../models/user';
import { FirestorePath, FirestoreService } from '../services/firestore.service';
import { LoggingService } from '../services/logging.service';

const cls: string = 'google-oauth';

const GoogleOAuthStrategy = passport.Strategy;

const options: StrategyOptions = {
    clientID: process.env.OAUTH_CLIENT_ID as string,
    clientSecret: process.env.OAUTH_CLIENT_SECRET as string,
    callbackURL: '/api/signin/google/reroute',
    scope: ['profile', 'email'],
};

const googleOAuthStrategy = new GoogleOAuthStrategy(
    options,
    async (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback
    ) => {
        const fn: string = 'googleOAuthStrategy';

        LoggingService.debug({
            cls: cls,
            fn: fn,
            message: 'Authenticating with Passport Google OAuth strategy...',
            data: {
                externalId: profile.id,
                email: profile.emails?.[0].value,
            },
        });

        const user = await FirestoreService.findOne(
            FirestorePath.USER,
            'externalId',
            '==',
            profile.id
        );

        if (!user) {
            await FirestoreService.storeOne(FirestorePath.USER, {
                externalId: profile.id,
                email: profile.emails?.[0].value,
                firstName: profile.name?.givenName,
                lastName: profile.name?.familyName,
                role: Role.USER,
                status: Status.ACTIVE,
            });

            const newUser = await FirestoreService.findOne(
                FirestorePath.USER,
                'externalId',
                '==',
                profile.id
            );

            if (!newUser) {
                LoggingService.error({
                    cls: cls,
                    fn: fn,
                    message:
                        'Authentication with Passport Google OAuth failure; external identifier did not exist and new user could not be created.',
                    data: {
                        externalId: profile.id,
                        email: profile.emails?.[0].value,
                    },
                });

                return done(null, false);
            }

            LoggingService.info({
                cls: cls,
                fn: fn,
                message:
                    'Google OAuth sign-up success; user profile created and stored.',
                data: {
                    externalId: newUser.externalId,
                    email: newUser.email,
                },
            });

            return done(null, newUser);
        }

        LoggingService.debug({
            cls: cls,
            fn: fn,
            message: 'Authentication with Passport Google OAuth success.',
            data: {
                externalId: user.externalId,
                email: user.email,
            },
        });

        return done(null, user);
    }
);

export default googleOAuthStrategy;
