import { createRequest } from 'node-mocks-http';
import { Profile } from '../../../src/models/user';
import { ProfileService } from '../../../src/services/profile.service';

const id: string = 'cncTQGhA3VsaoPNvnGGy';
const email: string = 'testuser@muzzarelli.dev';
const firstName: string = 'Test';
const lastName: string = 'User';

describe('ProfileService', () => {
    describe('extract', () => {
        it('should return `User` model while `request.user` exists and contains required data', () => {
            const request = createRequest({
                user: {
                    id: id,
                    email: email,
                    firstName: firstName,
                    lastName: lastName,
                },
            });

            const profile: Profile | undefined =
                ProfileService.extract(request);

            expect(profile).not.toBeUndefined();
            expect(profile?.id).toBe(id);
        });
    });

    it('should return `undefined` while `request.user` does not exist', () => {
        const request = createRequest();
        const profile: Profile | undefined = ProfileService.extract(request);

        expect(profile).toBeUndefined();
    });
});
