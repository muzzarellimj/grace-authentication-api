import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { DEFAULT_JWT_TTL } from '../constants';
import { User } from '../models/user';
import AuthenticationStateService from '../services/authentication-state.service';
import { LoggingService } from '../services/logging.service';

const cls: string = 'authentication';

export async function preventAuthentication(
    request: Request,
    response: Response,
    next: NextFunction
) {
    const fn: string = 'preventAuthentication';

    LoggingService.debug({
        cls: cls,
        fn: fn,
        message: 'Preventing existing authentication state...',
    });

    const cookies: Record<string, any> = request.cookies;

    if (cookies.token) {
        const tokenExpired: boolean = isTokenExpired(cookies.token);

        response = await AuthenticationStateService.clearAuthenticationState(
            cookies.token,
            response
        );

        if (!tokenExpired) {
            LoggingService.warn({
                cls: cls,
                fn: 'preventAuthentication',
                message:
                    'Unexpired authentication discovered; authentication state has been cleared.',
                data: {
                    id: request.cookies.id,
                    token: request.cookies.token,
                },
            });

            return response.status(StatusCodes.FORBIDDEN).json({
                message: 'Oops! We hit a snag. Please try again later.',
            });
        }
    }

    LoggingService.debug({
        cls: cls,
        fn: fn,
        message:
            'Existing authentication does not exist; proceeding to next function.',
    });

    next();
}

export async function handleAuthentication(
    request: Request,
    response: Response,
    next: NextFunction
) {
    const fn: string = 'handleAuthentication';

    LoggingService.debug({
        cls: cls,
        fn: fn,
        message:
            'Passport authentication success; handling local server-side authentication...',
    });

    const user: User | undefined = request.user;
    const cookies: Record<string, any> = request.cookies;

    if (!user || !user.id) {
        LoggingService.error({
            cls: cls,
            fn: fn,
            message:
                'Passport strategy authentication succeeded but user data could not be extracted to persist authentication.',
            data: {
                cookies: {
                    id: cookies.id,
                    token: cookies.token,
                },
                user: {
                    id: user?.id,
                    externalId: user?.externalId,
                },
            },
        });

        return response
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: 'Oops! We hit a snag. Please try again later.' });
    }

    if (cookies.token) {
        response = await AuthenticationStateService.clearAuthenticationState(
            cookies.token,
            response
        );
    }

    const token: string = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET as string,
        {
            expiresIn: DEFAULT_JWT_TTL,
        }
    );

    response = await AuthenticationStateService.storeAuthenticationState(
        user,
        token,
        response
    );

    LoggingService.debug({
        cls: cls,
        fn: fn,
        message:
            'Local server-side authentication success; proceeding to next function.',
    });

    next();
}

export async function handleDeauthentication(
    request: Request,
    response: Response,
    next: NextFunction
) {
    const fn: string = 'handleDeauthentication';

    LoggingService.debug({
        cls: cls,
        fn: fn,
        message:
            'Passport authentication success; handling local server-side deauthentication...',
    });

    const user: User | undefined = request.user;

    if (!user || !user.id) {
        LoggingService.error({
            cls: cls,
            fn: fn,
            message:
                'Passport strategy authentication succeeded but user data could not be extracted to persist deauthentication.',
            data: {
                cookies: {
                    id: request.cookies.id,
                    token: request.cookies.token,
                },
                user: {
                    id: user?.id,
                    externalId: user?.externalId,
                },
            },
        });

        return response
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: 'Oops! We hit a snag. Please try again later.' });
    }

    response = await AuthenticationStateService.clearAuthenticationState(
        request.cookies.token,
        response
    );

    LoggingService.debug({
        cls: cls,
        fn: fn,
        message:
            'Local server-side deauthentication success; proceeding to next function.',
    });

    next();
}

function isTokenExpired(token: string): boolean {
    const payload: string | JwtPayload | null = jwt.decode(token);

    if (!payload || typeof payload == 'string') {
        return true;
    }

    const now: number = Date.now() / 1000;

    return payload.exp && payload.exp <= now ? true : false;
}
