import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import application from '../../src/application';
import {
    FirestorePath,
    FirestoreService,
} from '../../src/services/firestore.service';

describe('authenticate', () => {
    beforeAll(async () => {
        await deleteTestUser();
    });

    afterAll(async () => {
        await deleteTestUser();
    });

    describe('sign up with email address and password', () => {
        it('should create user with valid email and password', async () => {
            const response = await request(application)
                .post('/api/signup')
                .set('content-type', 'application/json')
                .send({
                    email: 'testuser@muzzarelli.dev',
                    password: 'simple!test?password',
                    firstName: 'Test',
                    lastName: 'User',
                });

            expect(response.status).toBe(StatusCodes.CREATED);
            expect(response.body.message).toBe(
                'Your user profile has been created. Welcome to Grace!'
            );
        });

        it('should not create user when email is invalid', async () => {
            const response = await request(application)
                .post('/api/signup')
                .set('content-type', 'application/json')
                .send({
                    email: 'notanemail',
                    password: 'simple!test?password',
                    firstName: 'Test',
                    lastName: 'User',
                });

            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
            expect(response.body.message).toBe(
                'Please enter a valid email address.'
            );
        });

        it('should not create user when password is invalid', async () => {
            const response = await request(application)
                .post('/api/signup')
                .set('content-type', 'application/json')
                .send({
                    email: 'correctemail@butnotpassword.com',
                    password: 'pswd',
                    firstName: 'Test',
                    lastName: 'User',
                });

            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
            expect(response.body.message).toBe(
                'Please enter a password with 8 or more characters.'
            );
        });

        it('should not create user when email already exists', async () => {
            const response = await request(application)
                .post('/api/signup')
                .set('content-type', 'application/json')
                .send({
                    email: 'testuser@muzzarelli.dev',
                    password: 'simple!test?password',
                    firstName: 'Test',
                    lastName: 'User',
                });

            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
            expect(response.body.message).toBe(
                'A user account already exists with this email address.'
            );
        });
    });

    describe('sign in with email address and password', () => {
        let token: string;

        beforeEach(() => {
            token = '';
        });

        it('should sign in with correct email and password', async () => {
            const response = await request(application)
                .post('/api/signin')
                .set('content-type', 'application/json')
                .send({
                    email: 'testuser@muzzarelli.dev',
                    password: 'simple!test?password',
                });

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.profile?.email).toBe(
                'testuser@muzzarelli.dev'
            );

            token = response.body.token;
            expect(token).not.toBeNull();

            deleteTestSession(token);
        });

        it('should not sign in with correct email and password but existing authentication', async () => {
            let response = await request(application)
                .post('/api/signin')
                .set('content-type', 'application/json')
                .send({
                    email: 'testuser@muzzarelli.dev',
                    password: 'simple!test?password',
                });

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.profile?.email).toBe(
                'testuser@muzzarelli.dev'
            );

            token = response.body.token;
            expect(token).not.toBeNull();

            response = await request(application)
                .post('/api/signin')
                .set('content-type', 'application/json')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    email: 'testuser@muzzarelli.dev',
                    password: 'simple!test?password',
                });

            expect(response.status).toBe(StatusCodes.FORBIDDEN);
            expect(response.body.message).toBe(
                'Oops! We hit a snag. Please try again later.'
            );
        });

        it('should not sign in with incorrect email', async () => {
            const response = await request(application)
                .post('/api/signin')
                .set('content-type', 'application/json')
                .send({
                    email: 'emailaddress@doesnotexist.com',
                    password: 'simple!test?password',
                });

            expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
        });

        it('should not sign in with incorrect password', async () => {
            const response = await request(application)
                .post('/api/signin')
                .set('content-type', 'application/json')
                .send({
                    email: 'testuser@muzzarelli.dev',
                    password: 'incorrect!test?password',
                });

            expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
        });
    });

    describe('pulse', () => {
        let token: string;

        beforeEach(() => {
            token = '';
        });

        it('should pulse OK with existing authentication', async () => {
            let response = await request(application)
                .post('/api/signin')
                .set('content-type', 'application/json')
                .send({
                    email: 'testuser@muzzarelli.dev',
                    password: 'simple!test?password',
                });

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.profile?.email).toBe(
                'testuser@muzzarelli.dev'
            );

            token = response.body.token;
            expect(token).not.toBe('');

            response = await request(application)
                .post('/api/pulse')
                .set('content-type', 'application/json')
                .set('authorization', `Bearer ${token}`)
                .send();

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.profile?.email).toBe(
                'testuser@muzzarelli.dev'
            );
            expect(response.body.token).toBe(token);

            deleteTestSession(token);
        });

        it('should pulse UNAUTHORIZED without existing authentication', async () => {
            const response = await request(application)
                .post('/api/pulse')
                .set('content-type', 'application/json')
                .send();

            expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
        });
    });

    describe('sign out', () => {
        let token: string;

        beforeEach(() => {
            token = '';
        });

        it('should sign out with existing authentication', async () => {
            const agent = request.agent(application);

            let response = await agent
                .post('/api/signin')
                .set('content-type', 'application/json')
                .send({
                    email: 'testuser@muzzarelli.dev',
                    password: 'simple!test?password',
                });

            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.profile?.email).toBe(
                'testuser@muzzarelli.dev'
            );

            // token = extractCookie(agent, 'token');

            response = await agent
                .post('/api/signout')
                .set('content-type', 'application/json')
                .set('Cookie', `token=${token}`)
                .send();

            expect(response.status).toBe(StatusCodes.OK);
        });

        it('should not sign out without existing authentication', async () => {
            const agent = request.agent(application);
            const response = await agent
                .post('/api/signout')
                .set('content-type', 'application/json')
                .send();

            expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
        });
    });
});

async function deleteTestUser() {
    await FirestoreService.deleteOne(
        FirestorePath.USER,
        'email',
        '==',
        'testuser@muzzarelli.dev'
    );
}

async function deleteTestSession(token: string) {
    await FirestoreService.deleteOne(
        FirestorePath.SESSION,
        'token',
        '==',
        token
    );
}
