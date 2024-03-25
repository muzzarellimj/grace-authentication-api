import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { DEFAULT_JWT_TTL } from '../constants';
import { User } from '../models/user';
import { FirestorePath, FirestoreService } from '../services/firestore.service';

/**
 * Set user authentication state: generate a JSON web token, set cookies `id` and `token`,
 * and send `id` and `token` in the response body.
 */
export async function setAuthentication(request: Request, response: Response, _: NextFunction) {
    const user: User | undefined = request.user;

    if (!user || !user.id) {
        return response
            .status(StatusCodes.UNAUTHORIZED)
            .json({ message: 'Oops! We hit a snag. Please try again later.' });
    }

    const token: string = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
        expiresIn: DEFAULT_JWT_TTL,
    });

    await FirestoreService.storeOne(FirestorePath.SESSION, {
        user: user.id,
        token: token,
    });

    response.cookie('id', user.id);
    response.cookie('token', token);

    response.status(StatusCodes.CREATED).json({ id: user.id, token });
}

/**
 * Clear user authentication state: clear cookies `id` and `token` should each exist and send an unauthorized status in response.
 */
export async function clearAuthentication(request: Request, response: Response, _: NextFunction) {
    const user: User | undefined = request.user;

    if (!user || !user.id) {
        return response.status(StatusCodes.UNAUTHORIZED).send();
    }

    const cookieToken: string = request.cookies.token;

    await FirestoreService.deleteOne(FirestorePath.SESSION, 'token', '==', cookieToken);

    response.clearCookie('id');
    response.clearCookie('token');

    response.status(StatusCodes.UNAUTHORIZED).send();
}
