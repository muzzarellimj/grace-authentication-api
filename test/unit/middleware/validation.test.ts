import { createRequest, createResponse } from 'node-mocks-http';
import { validateUserCreationArgs } from '../../../src/middleware/validation.middleware';
import { LoggingService } from '../../../src/services/logging.service';

const email: string = 'testuser@muzzarelli.dev';
const password: string = 'simple!test?password';
const firstName: string = 'Test';
const lastName: string = 'User';

describe('validation', () => {
    let nextFnMock: jest.Mock;

    beforeAll(() => {
        LoggingService.init();

        nextFnMock = jest.fn();
    });

    describe('validateUserCreationArgs', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should proceed to next with appropraite user creation arguments', () => {
            const request = createRequest({
                body: {
                    email: email,
                    password: password,
                    firstName: firstName,
                    lastName: lastName,
                },
            });
            const response = createResponse();

            validateUserCreationArgs(request, response, nextFnMock);

            expect(nextFnMock).toHaveBeenCalled();
        });

        it('should not proceed to next with inappropriate email argument', () => {
            const request = createRequest({
                body: {
                    email: 'notanemailaddress',
                    password: password,
                    firstName: firstName,
                    lastName: lastName,
                },
            });
            const response = createResponse();

            validateUserCreationArgs(request, response, nextFnMock);

            expect(nextFnMock).not.toHaveBeenCalled();
        });

        it('should not proceed to next with inappropriate password argument', () => {
            const request = createRequest({
                body: {
                    email: email,
                    password: 'pswd',
                    firstName: firstName,
                    lastName: lastName,
                },
            });
            const response = createResponse();

            validateUserCreationArgs(request, response, nextFnMock);

            expect(nextFnMock).not.toHaveBeenCalled();
        });

        it('should not proceed to next with inappropriate name argument', () => {
            const request = createRequest({
                body: {
                    email: email,
                    password: password,
                },
            });
            const response = createResponse();

            validateUserCreationArgs(request, response, nextFnMock);

            expect(nextFnMock).not.toHaveBeenCalled();
        });
    });
});
