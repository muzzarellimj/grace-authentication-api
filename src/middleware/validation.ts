import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodSchema, z } from 'zod';

const MIN_PASSWORD_LENGTH: number = 8;

const userCreationArgsSchema: ZodSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z.string().min(MIN_PASSWORD_LENGTH, {
        message: 'Please enter a password with 8 or more characters.',
    }),
    firstName: z.string({
        required_error: 'Please provide an appropriate first name.',
    }),
    lastName: z.string({
        required_error: 'Please provide an appropriate last name.',
    }),
});

export function validateUserCreationArgs(
    request: Request,
    response: Response,
    next: NextFunction
) {
    const validationState = userCreationArgsSchema.safeParse({
        email: request.body.email,
        password: request.body.password,
        firstName: request.body.firstName,
        lastName: request.body.lastName,
    });

    if (!validationState.success) {
        const message: string =
            validationState.error.issues[0]?.message ??
            'Oops! We hit a snag. Please try again later.';

        return response
            .status(StatusCodes.BAD_REQUEST)
            .json({ status: StatusCodes.BAD_REQUEST, message: message });
    }

    next();
}
