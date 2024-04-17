import { Response } from 'express';
import { User } from '../models/user';
import { FirestorePath, FirestoreService } from './firestore.service';
import { LoggingService } from './logging.service';

export default class AuthenticationStateService {
    static cls: string = 'AuthenticationStateService';

    static async storeAuthenticationState(
        user: User,
        token: string,
        response: Response
    ): Promise<Response> {
        const fn: string = 'storeAuthenticationState';

        LoggingService.debug({
            cls: AuthenticationStateService.cls,
            fn: fn,
            message: 'Authentication success; storing authentication state...',
        });

        await FirestoreService.storeOne(FirestorePath.SESSION, {
            user: user.id,
            token: token,
        });

        response.cookie('id', user.id);
        response.cookie('token', token);

        LoggingService.info({
            cls: AuthenticationStateService.cls,
            fn: fn,
            message: 'Authentication state has been stored with success.',
            data: {
                id: user.id,
                token: token,
            },
        });

        return response;
    }

    static async clearAuthenticationState(
        token: string,
        response: Response
    ): Promise<Response> {
        const fn: string = 'clearAuthenticationState';

        LoggingService.debug({
            cls: AuthenticationStateService.cls,
            fn: fn,
            message: 'Clearing authentication state...',
        });

        await FirestoreService.deleteOne(
            FirestorePath.SESSION,
            'token',
            '==',
            token
        );

        response.clearCookie('id');
        response.clearCookie('token');

        LoggingService.info({
            cls: AuthenticationStateService.cls,
            fn: fn,
            message: 'Authentication state has been cleared with success.',
            data: {
                token: token,
            },
        });

        return response;
    }
}
