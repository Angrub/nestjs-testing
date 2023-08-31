import {
	IsEmail,
	IsNotEmpty,
	IsString,
	MaxLength,
	ValidateIf,
} from 'class-validator';

export class RegisterDto {
	@MaxLength(255)
	@IsNotEmpty()
	readonly password: string;

	@MaxLength(255)
	@ValidateIf((o, v) => o.password === v)
	@IsNotEmpty()
	readonly passwordConfirm: string;

	@IsEmail()
	@MaxLength(255)
	@IsNotEmpty()
	readonly email: string;

	@IsString()
	@IsNotEmpty()
	readonly publicKey: string;

	@MaxLength(255)
	@IsNotEmpty()
	readonly firstName: string;

	@MaxLength(255)
	@IsNotEmpty()
	readonly lastName: string;
}

export class LoginDto {
	@MaxLength(255)
	@IsNotEmpty()
	readonly password: string;

	@IsEmail()
	@MaxLength(255)
	@IsNotEmpty()
	readonly email: string;
}

export interface PayloadToken {
	// role: number;
	sub: number;
}
