import passport, { ExtractJwt, VerifiedCallback } from 'passport-jwt';
import { FirestorePath, FirestoreService } from '../services/firestore.service';
import { LoggingService } from '../services/logging.service';

const cls: string = 'jwt';

const JwtStrategy = passport.Strategy;

const options = {
    secretOrKey: process.env.JWT_SECRET as string,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

type JwtPayload = {
    id: string;
    iat: number;
    exp: number;
};

const jwtStrategy = new JwtStrategy(
    options,
    async (payload: JwtPayload, done: VerifiedCallback) => {
        const fn: string = 'jwtStrategy';

        LoggingService.debug({
            cls: cls,
            fn: fn,
            message: 'Authenticating with Passport JWT strategy...',
            data: {
                id: payload.id,
                issuedAt: payload.iat,
                expiresAt: payload.exp,
            },
        });

        const user = await FirestoreService.findOne(
            FirestorePath.USER,
            'id',
            '==',
            payload.id
        );

        if (!user) {
            LoggingService.warn({
                cls: cls,
                fn: fn,
                message:
                    'Authentication with JWT strategy failure; matching user does not exist.',
                data: {
                    id: payload.id,
                    issuedAt: payload.iat,
                    expiresAt: payload.exp,
                },
            });

            return done(null, false);
        }

        LoggingService.debug({
            cls: cls,
            fn: fn,
            message: 'Authentication with JWT strategy success.',
            data: {
                id: payload.id,
                issuedAt: payload.iat,
                expiresAt: payload.exp,
            },
        });

        return done(null, user);
    }
);

export default jwtStrategy;
