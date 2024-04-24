import { Request } from 'express';
import { Role, Status } from '../models/user';
import { LoggingService } from '../services/logging.service';
import { encrypt } from './password.util';

const cls: string = 'argument.util';

export function processEmailArg(request: Request, data: any): any {
    const fn: string = 'processEmailArg';

    const emailArg: string | undefined = request.body.email;

    if (!emailArg || emailArg.length == 0) {
        LoggingService.debug({
            cls: cls,
            fn: fn,
            message:
                'Email argument is empty; data object has not been manipulated.',
        });

        return data;
    }

    LoggingService.debug({
        cls: cls,
        fn: fn,
        message:
            'Email is valid; data object has been manipulated to include email.',
    });

    data.email = emailArg.toLowerCase();

    return data;
}

export function processNameArg(argument: string, request: Request, data: any) {
    const fn: string = 'processNameArg';

    const nameArg: string | undefined = request.body[argument];

    if (!nameArg || nameArg.length == 0) {
        LoggingService.debug({
            cls: cls,
            fn: fn,
            message:
                'Name argument is empty; data object has not been manipulated.',
        });

        return data;
    }

    LoggingService.debug({
        cls: cls,
        fn: fn,
        message:
            'Name argument is valid; data object has been manipulated to include name.',
    });

    data[argument] = nameArg;

    return data;
}

export function processPasswordArg(request: Request, data: any): any {
    const fn: string = 'processPasswordArg';

    const passwordArg: string | undefined = request.body.password;

    if (!passwordArg || passwordArg.length == 0) {
        LoggingService.debug({
            cls: cls,
            fn: fn,
            message:
                'Password argument is empty; data object has not been manipulated.',
        });

        return data;
    }

    const hash: string | undefined = encrypt(passwordArg);

    if (!hash || hash.length == 0) {
        LoggingService.debug({
            cls: cls,
            fn: fn,
            message:
                'Generated password hash is empty; data object has not been manipulated.',
        });

        return data;
    }

    LoggingService.debug({
        cls: cls,
        fn: fn,
        message:
            'Password hash generated; data object has been manipulated to include password.',
    });

    data.password = hash;

    return data;
}

export function processRoleArg(request: Request, data: any): any {
    const fn: string = 'processRoleArg';

    const roleArg: number | undefined = request.body.role;

    if (!roleArg) {
        LoggingService.debug({
            cls: cls,
            fn: fn,
            message:
                'Role argument is empty; data object has not been manipulated.',
        });

        return data;
    }

    let role: Role;

    try {
        role = roleArg;
    } catch (err: any) {
        LoggingService.warn({
            cls: cls,
            fn: fn,
            message:
                'Role argument could not be parsed; data object has not been manipulated.',
        });

        return data;
    }

    LoggingService.debug({
        cls: cls,
        fn: fn,
        message: `Role argument parsed as ${role}; data object has been manipulated to include role.`,
    });

    data.role = role;

    return data;
}

export function processStatusArg(request: Request, data: any): any {
    const fn: string = 'processStatusArg';

    const statusArg: number | undefined = request.body.status;

    if (!statusArg) {
        LoggingService.debug({
            cls: cls,
            fn: fn,
            message:
                'Status argument is empty; data object has not been manipulated.',
        });

        return data;
    }

    let status: Status;

    try {
        status = statusArg;
    } catch (err: any) {
        LoggingService.warn({
            cls: cls,
            fn: fn,
            message:
                'Status argument could not be parsed; data object has not been manipulated.',
        });

        return data;
    }

    LoggingService.debug({
        cls: cls,
        fn: fn,
        message: `Status argument parsed as ${status}; data object has been manipulated to include role.`,
    });

    data.status = status;

    return data;
}
