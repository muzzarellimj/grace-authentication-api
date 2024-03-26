import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { DEFAULT_JWT_TTL } from '../constants';
import { User } from '../models/user';
import { FirestorePath, FirestoreService } from '../services/firestore.service';

export async function disallowExistingAuthentication(request: Request, response: Response, next: NextFunction) {
    const cookies: Record<string, any> = request.cookies;

    if (cookies.token) {
        const tokenExpired: boolean = isTokenExpired(cookies.token);

        response = await clearAuthenticationState(cookies.token, response);

        if (!tokenExpired) {
            return response
                .status(StatusCodes.FORBIDDEN)
                .json({ message: 'Oops! We hit a snag. Please try again later.' });
        }
    }

    next();
}

export async function handleAuthentication(request: Request, response: Response, next: NextFunction) {
    const user: User | undefined = request.user;
    const cookies: Record<string, any> = request.cookies;

    if (!user || !user.id) {
        return response
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: 'Oops! We hit a snag. Please try again later.' });
    }

    if (cookies.token) {
        response = await clearAuthenticationState(cookies.token, response);
    }

    const token: string = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
        expiresIn: DEFAULT_JWT_TTL,
    });

    response = await storeAuthenticationState(user, token, response);

    next();
}

export async function handleDeauthentication(request: Request, response: Response, next: NextFunction) {
    const user: User | undefined = request.user;

    if (!user || !user.id) {
        return response
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: 'Oops! We hit a snag. Please try again later.' });
    }

    response = await clearAuthenticationState(request.cookies.token, response);

    next();
}

export async function storeAuthenticationState(user: User, token: string, response: Response): Promise<Response> {
    await FirestoreService.storeOne(FirestorePath.SESSION, {
        user: user.id,
        token: token,
    });

    response.cookie('id', user.id);
    response.cookie('token', token);

    return response;
}

export async function clearAuthenticationState(token: string, response: Response): Promise<Response> {
    await FirestoreService.deleteOne(FirestorePath.SESSION, 'token', '==', token);

    response.clearCookie('id');
    response.clearCookie('token');

    return response;
}

function isTokenExpired(token: string): boolean {
    const payload: string | JwtPayload | null = jwt.decode(token);

    if (!payload || typeof payload == 'string') {
        return true;
    }

    const now: number = Date.now() / 1000;

    return payload.exp && payload.exp <= now ? true : false;
}
