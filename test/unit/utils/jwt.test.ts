import { Request } from 'express';
import { sign } from 'jsonwebtoken';
import { createRequest } from 'node-mocks-http';
import { LoggingService } from '../../../src/services/logging.service';
import { extractToken, isTokenExpired } from '../../../src/utils/jwt.util';

describe('jwt-util', () => {
    beforeAll(() => {
        LoggingService.init();
    });

    describe('extractToken', () => {
        it('should extract token when authorization header is present', () => {
            const expectedToken: string = 'simple!jwt?';

            const request: Request = createRequest({
                headers: {
                    authorization: `Bearer ${expectedToken}`,
                },
            });

            const token: string = extractToken(request);

            expect(token).toBe(expectedToken);
        });

        it('should not extract token and return empty string when authorization header is not present', () => {
            const request: Request = createRequest();
            const token: string = extractToken(request);

            expect(token).toBe('');
        });
    });

    describe('isTokenExpired', () => {
        const id: string = 'cncTQGhA3VsaoPNvnGGy';
        const secret: string = 'simple!jwt?secret';

        it('should determine expired token is expired', () => {
            const token: string = sign({ id: id }, secret, { expiresIn: -1 });
            const isExpired: boolean = isTokenExpired(token);

            expect(isExpired).toBe(true);
        });

        it('should determine unexpired token is not expired', () => {
            const token: string = sign({ id: id }, secret, { expiresIn: 60 });
            const isExpired: boolean = isTokenExpired(token);

            expect(isExpired).toBe(false);
        });
    });
});
