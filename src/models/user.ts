export type User = {
    id?: string;
    externalId?: string;
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    createdAt?: number;
};

export type Profile = {
    id: string;
    externalId?: string;
    email?: string;
    firstName: string;
    lastName: string;
};
