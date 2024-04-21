import { Request } from 'express';
import { Profile, User } from '../models/user';

export class ProfileService {
    static extract(request: Request): Profile | undefined {
        const user: User | undefined = request.user;

        if (!user || !user.id || !user.firstName || !user.lastName) {
            return undefined;
        }

        const profile: Profile = {
            id: user.id,
            externalId: user.externalId,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
        };

        return profile;
    }
}
