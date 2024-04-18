import { createResponse } from 'node-mocks-http';
import AuthenticationStateService from '../../../src/services/authentication-state.service';
import { FirestoreService } from '../../../src/services/firestore.service';
import { LoggingService } from '../../../src/services/logging.service';

const id: string = 'cncTQGhA3VsaoPNvnGGy';
const token: string = 'simple!unencrypted?jwt!token';

describe('AuthenticationStateService', () => {
    let deleteOneMock: jest.SpyInstance;
    let storeOneMock: jest.SpyInstance;

    beforeAll(() => {
        LoggingService.init();

        deleteOneMock = jest
            .spyOn(FirestoreService, 'deleteOne')
            .mockImplementation();
        storeOneMock = jest
            .spyOn(FirestoreService, 'storeOne')
            .mockImplementation();
    });

    describe('clearAuthenticationState', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should clear authentication state when `id` and `token` are provided', async () => {
            const response = createResponse();

            await AuthenticationStateService.clearAuthenticationState(
                token,
                response
            );

            expect(deleteOneMock).toHaveBeenCalled();
        });
    });

    describe('storeAuthenticationState', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should store authentication state when `user` and `token` are provided', async () => {
            const response = createResponse();

            await AuthenticationStateService.storeAuthenticationState(
                {
                    id: id,
                },
                token,
                response
            );

            expect(storeOneMock).toHaveBeenCalled();
        });
    });
});
