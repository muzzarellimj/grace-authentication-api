import { sign } from 'jsonwebtoken';
import { createRequest, createResponse } from 'node-mocks-http';
import {
    handleAuthentication,
    handleDeauthentication,
    preventAuthentication,
} from '../../../src/middleware/authentication.middleware';
import AuthenticationStateService from '../../../src/services/authentication-state.service';
import { FirestoreService } from '../../../src/services/firestore.service';
import { LoggingService } from '../../../src/services/logging.service';

const id: string = 'cncTQGhA3VsaoPNvnGGy';
const secret: string = 'simple!jwt?secret';

describe('authentication', () => {
    let nextFnMock: jest.Mock;

    let deleteOneMock: jest.SpyInstance;
    let storeOneMock: jest.SpyInstance;

    let clearAuthenticationStateSpy: jest.SpyInstance;
    let storeAuthenticationStateSpy: jest.SpyInstance;

    beforeAll(() => {
        LoggingService.init();

        nextFnMock = jest.fn();

        deleteOneMock = jest
            .spyOn(FirestoreService, 'deleteOne')
            .mockImplementation();
        storeOneMock = jest
            .spyOn(FirestoreService, 'storeOne')
            .mockImplementation();

        clearAuthenticationStateSpy = jest.spyOn(
            AuthenticationStateService,
            'clearAuthenticationState'
        );
        storeAuthenticationStateSpy = jest.spyOn(
            AuthenticationStateService,
            'storeAuthenticationState'
        );
    });

    describe('preventAuthentication', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should proceed to next while authentication does not exist', async () => {
            const request = createRequest();
            const response = createResponse();

            await preventAuthentication(request, response, nextFnMock);

            expect(clearAuthenticationStateSpy).not.toHaveBeenCalled();
            expect(deleteOneMock).not.toHaveBeenCalled();
            expect(nextFnMock).toHaveBeenCalled();
        });

        it('should proceed to next while authentication exists but token is expired', async () => {
            const token: string = sign({ id: id }, secret, { expiresIn: -1 });

            const request = createRequest({
                cookies: {
                    id: id,
                    token: token,
                },
            });
            const response = createResponse();

            await preventAuthentication(request, response, nextFnMock);

            expect(clearAuthenticationStateSpy).toHaveBeenCalled();
            expect(deleteOneMock).toHaveBeenCalled();
            expect(nextFnMock).toHaveBeenCalled();
        });

        it('should not proceed to next while authentication exists and token is not expired', async () => {
            const token: string = sign({ id: id }, secret, { expiresIn: '1h' });

            const request = createRequest({
                cookies: {
                    id: id,
                    token: token,
                },
            });
            const response = createResponse();

            await preventAuthentication(request, response, nextFnMock);

            expect(clearAuthenticationStateSpy).toHaveBeenCalled();
            expect(deleteOneMock).toHaveBeenCalled();
            expect(nextFnMock).not.toHaveBeenCalled();
        });
    });

    describe('handleAuthentication', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            process.env.JWT_SECRET = secret;
        });

        it('should persist authentication while `request.user` is non-null', async () => {
            const request = createRequest({
                user: {
                    id: id,
                },
            });
            const response = createResponse();

            await handleAuthentication(request, response, nextFnMock);

            expect(clearAuthenticationStateSpy).not.toHaveBeenCalled();
            expect(deleteOneMock).not.toHaveBeenCalled();
            expect(storeAuthenticationStateSpy).toHaveBeenCalled();
            expect(storeOneMock).toHaveBeenCalled();
            expect(nextFnMock).toHaveBeenCalled();
        });

        it('should persist authentication while `request.user` is non-null and token is present in cookie', async () => {
            const token = sign({ id: id }, secret, { expiresIn: -1 });

            const request = createRequest({
                cookies: {
                    id: id,
                    token: token,
                },
                user: {
                    id: id,
                },
            });
            const response = createResponse();

            await handleAuthentication(request, response, nextFnMock);

            expect(clearAuthenticationStateSpy).toHaveBeenCalled();
            expect(deleteOneMock).toHaveBeenCalled();
            expect(storeAuthenticationStateSpy).toHaveBeenCalled();
            expect(storeOneMock).toHaveBeenCalled();
            expect(nextFnMock).toHaveBeenCalled();
        });

        it('should not persist authentication while `request.user` is null', async () => {
            const request = createRequest();
            const response = createResponse();

            await handleAuthentication(request, response, nextFnMock);

            expect(clearAuthenticationStateSpy).not.toHaveBeenCalled();
            expect(deleteOneMock).not.toHaveBeenCalled();
            expect(storeAuthenticationStateSpy).not.toHaveBeenCalled();
            expect(storeOneMock).not.toHaveBeenCalled();
            expect(nextFnMock).not.toHaveBeenCalled();
        });
    });

    describe('handleDeauthentication', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should clear authentication while `request.user` is non-null', async () => {
            const request = createRequest({
                user: {
                    id: id,
                },
            });
            const response = createResponse();

            await handleDeauthentication(request, response, nextFnMock);

            expect(clearAuthenticationStateSpy).toHaveBeenCalled();
            expect(nextFnMock).toHaveBeenCalled();
        });

        it('should not clear authentication while `request.user` is null', async () => {
            const request = createRequest();
            const response = createResponse();

            await handleDeauthentication(request, response, nextFnMock);

            expect(clearAuthenticationStateSpy).not.toHaveBeenCalled();
            expect(nextFnMock).not.toHaveBeenCalled();
        });
    });
});
