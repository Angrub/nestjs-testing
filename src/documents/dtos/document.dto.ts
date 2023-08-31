import { IsNotEmpty, MaxLength } from 'class-validator';

export class CreateDocumentDto {
	@MaxLength(255)
	@IsNotEmpty()
	readonly digitalSignature: string;
}
