import { Request } from 'express';
import { JwtPayload, decode } from 'jsonwebtoken';
import { LoggingService } from '../services/logging.service';

const cls: string = 'jwt-util';

export function extractToken(request: Request): string {
    const fn: string = 'extractToken';

    const header: string | undefined = request.headers['authorization'];

    if (typeof header == 'undefined') {
        LoggingService.debug({
            cls: cls,
            fn: fn,
            message:
                'JWT could not be extracted; authorization header does not exist.',
        });

        return '';
    }

    const token: string = header.replace('Bearer', '').trim();

    if (token.length == 0) {
        LoggingService.debug({
            cls: cls,
            fn: fn,
            message:
                'JWT could not be extracted; authorization header was present with an empty token value.',
        });

        return '';
    }

    LoggingService.debug({
        cls: cls,
        fn: fn,
        message: 'JWT extracted with present authorization header.',
        data: {
            token: token,
        },
    });

    return token;
}

export function isTokenExpired(token: string): boolean {
    const payload: string | JwtPayload | null = decode(token);

    if (!payload || typeof payload == 'string') {
        return true;
    }

    const now: number = Date.now() / 1000;

    return payload.exp && payload.exp <= now ? true : false;
}
