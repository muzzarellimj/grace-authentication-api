import { Auth, AuthErrorCodes, UserCredential, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export type AuthenticationResponse = {
    code: number,
    message: string
}

export async function createUser(auth: Auth, email: string, password: string): Promise<AuthenticationResponse> {
    try {
        const credential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);

        console.log(`A user with UID ${credential.user.uid} was created with the email-password Firebase authentication module.`);

        return {
            code: 201,
            message: 'A user was created with the email-password Firebase authentication module.'
        }

    } catch (error: any) {
        if (error.code == AuthErrorCodes.INVALID_PASSWORD) {
            console.log(`An invalid password was provided to the email-password Firebase authentication module.`);
        } else {
            console.log(`An unhandled error was caught in the email-password Firebase authentication module.`);
        }

        return {
            code: 400,
            message: 'An error occurred - please try again later.'
        }
    }
}

export async function signinUser(auth: Auth, email: string, password: string): Promise<AuthenticationResponse> {
    try {
        const credential: UserCredential = await signInWithEmailAndPassword(auth, email, password);

        console.log(`A user with UID ${credential.user.uid} was signed in with the email-password Firebase authentication module.`);

        return {
            code: 200,
            message: 'A user was signed in with the email-password Firebase authentication module.'
        }
    } catch (error: any) {
        if (error.code == AuthErrorCodes.INVALID_PASSWORD) {
            console.log(`An invalid password was provided to the email-password Firebase authentication module.`);
        } else {
            console.log(`An unhandled error "${error.code}" was caught in the email-password Firebase authentication module.`);
        }

        return {
            code: 400,
            message: 'An error occurred - please try again later.'
        }
    }
}

export async function signoutUser(auth: Auth) {
    await auth.signOut();

    console.log('A user was signed out with the email-password Firebase authentication module.');
}