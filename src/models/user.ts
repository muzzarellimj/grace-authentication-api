export type User = {
    id?: string;
    externalId?: string;
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    createdAt?: number;
    role: Role;
    status: Status;
};

export type Profile = {
    id: string;
    externalId?: string;
    email?: string;
    firstName: string;
    lastName: string;
    role: Role;
    status: Status;
};

export enum Role {
    USER,
    ADMINISTRATOR,
}

export enum Status {
    ACTIVE,
    RESTRICTED,
}
