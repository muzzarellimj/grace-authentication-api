import passport, {
    Profile,
    StrategyOptions,
    VerifyCallback,
} from 'passport-google-oauth20';
import { FirestorePath, FirestoreService } from '../services/firestore.service';

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
        const existingUser = await FirestoreService.findOne(
            FirestorePath.USER,
            'externalId',
            '==',
            profile.id
        );

        if (!existingUser) {
            console.log(profile);

            await FirestoreService.storeOne(FirestorePath.USER, {
                externalId: profile.id,
                email: profile.emails?.[0].value,
                firstName: profile.name?.givenName,
                lastName: profile.name?.familyName,
            });

            const newUser = await FirestoreService.findOne(
                FirestorePath.USER,
                'externalId',
                '==',
                profile.id
            );

            if (!newUser) {
                return done(null, false);
            }

            return done(null, newUser);
        }

        return done(null, existingUser);
    }
);

export default googleOAuthStrategy;
