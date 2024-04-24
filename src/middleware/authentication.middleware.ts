import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { DEFAULT_JWT_TTL } from '../constants';
import { User } from '../models/user';
import AuthenticationStateService from '../services/authentication-state.service';
import { LoggingService } from '../services/logging.service';
import { extractToken, isTokenExpired } from '../utils/jwt.util';

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

    const token: string = extractToken(request);

    if (token.length != 0) {
        const tokenExpired: boolean = isTokenExpired(token);

        response = await AuthenticationStateService.clearAuthenticationState(
            token,
            response
        );

        if (!tokenExpired) {
            LoggingService.warn({
                cls: cls,
                fn: 'preventAuthentication',
                message:
                    'Unexpired token discovered; existing authentication state has been cleared.',
                data: {
                    token: token,
                },
            });

            return response.status(StatusCodes.FORBIDDEN).json({
                status: StatusCodes.FORBIDDEN,
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

    const user: User | undefined = request.user as User;

    if (!user || !user.id) {
        LoggingService.error({
            cls: cls,
            fn: fn,
            message:
                'Passport strategy authentication succeeded but user data could not be extracted to persist authentication.',
            data: {
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

    const oldToken: string = extractToken(request);

    if (oldToken) {
        response = await AuthenticationStateService.clearAuthenticationState(
            oldToken,
            response
        );
    }

    const newToken: string = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET as string,
        {
            expiresIn: DEFAULT_JWT_TTL,
        }
    );

    response.locals.token = newToken;

    response = await AuthenticationStateService.storeAuthenticationState(
        user,
        newToken,
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

    const user: User | undefined = request.user as User;

    if (!user || !user.id) {
        LoggingService.error({
            cls: cls,
            fn: fn,
            message:
                'Passport strategy authentication succeeded but user data could not be extracted to persist deauthentication.',
            data: {
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

    const token: string = extractToken(request);

    if (!token) {
        LoggingService.error({
            cls: cls,
            fn: fn,
            message:
                'Passport strategy authentication succeeded but a JWT could not be extracted.',
            data: {
                user: {
                    id: user?.id,
                    externalId: user?.externalId,
                },
            },
        });
    }

    response = await AuthenticationStateService.clearAuthenticationState(
        token,
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
