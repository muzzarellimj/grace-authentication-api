export class ValidationService {
    static validateEmailAddress(value: string): boolean {
        const pattern = /^\S+@\S+\.\S+$/;

        return pattern.test(value);
    }
}
