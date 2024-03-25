import { Request } from 'express';
import passport, { VerifiedCallback } from 'passport-jwt';
import { FirestorePath, FirestoreService } from '../services/firestore.service';

const JwtStrategy = passport.Strategy;

const options = {
    secretOrKey: process.env.JWT_SECRET as string,
    jwtFromRequest: cookieExtractor,
};

type JwtPayload = {
    id: string;
    iat: number;
    exp: number;
};

const jwtStrategy = new JwtStrategy(options, async (payload: JwtPayload, done: VerifiedCallback) => {
    const matchingUser = await FirestoreService.findOne(FirestorePath.USER, 'id', '==', payload.id);

    if (!matchingUser) {
        return done(null, false);
    }

    return done(null, matchingUser);
});

function cookieExtractor(request: Request) {
    return request?.cookies?.token;
}

export default jwtStrategy;
