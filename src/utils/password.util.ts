import bcrypt from 'bcrypt';
import { DEFAULT_SALT_ROUND_COUNT } from '../constants';
import { LoggingService } from '../services/logging.service';

const cls: string = 'password.util';

export function encrypt(password: string): string | undefined {
    const fn: string = 'encrypt';

    LoggingService.debug({
        cls: cls,
        fn: fn,
        message: 'Encrypting password...',
    });

    const hash: string = bcrypt.hashSync(password, DEFAULT_SALT_ROUND_COUNT);

    if (!hash || hash.length == 0) {
        LoggingService.error({
            cls: cls,
            fn: fn,
            message:
                'Unable to encrypt password; generated password hash is empty.',
        });

        return undefined;
    }

    LoggingService.debug({
        cls: cls,
        fn: fn,
        message: 'A password hash has been generated successfully.',
    });

    return hash;
}
