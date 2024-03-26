import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { DEFAULT_JWT_TTL } from '../constants';
import { User } from '../models/user';
import { FirestorePath, FirestoreService } from '../services/firestore.service';

export async function handleAuthentication(request: Request, response: Response, next: NextFunction) {
    const user: User | undefined = request.user;

    if (!user || !user.id) {
        return response
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: 'Oops! We hit a snag. Please try again later.' });
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
