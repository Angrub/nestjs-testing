import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateUserDto {
	@MaxLength(255)
	@IsNotEmpty()
	readonly password: string;

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
