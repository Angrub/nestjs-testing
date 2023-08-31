import { IsNotEmpty, IsPositive, MaxLength } from 'class-validator';

export class CreateGroupDto {
	@MaxLength(255)
	@IsNotEmpty()
	readonly name: string;

	@IsPositive({ each: true })
	// @IsNo()
	readonly userIds: number[];
}

export class AddDocumentDto {
	@IsPositive({ each: true })
	readonly documentIds: number[];
}

export class AddUsersDto {
	@IsPositive({ each: true })
	readonly userIds: number[];
}
