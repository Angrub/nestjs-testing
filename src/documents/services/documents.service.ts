import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Document } from '../entities/document.entity';
import { In, Repository } from 'typeorm';
import { PayloadToken } from '../../users/dtos/auth.dto';
import { UsersService } from '../../users/services/users.service';
import { CreateDocumentDto } from '../dtos/document.dto';
import { createReadStream } from 'node:fs';
import { join } from 'path';

@Injectable()
export class DocumentsService {
	constructor(
		@InjectRepository(Document) private documentRepo: Repository<Document>,
		private usersService: UsersService,
	) {}

	async list() {
		return await this.documentRepo.find();
	}

	async findByFilename(filename: string) {
		const document = await this.documentRepo.findOne({
			where: { filename },
		});

		if (!document)
			throw new NotFoundException(`Not found file ${filename}`);

		return document;
	}

	async findByIds(ids: number[]) {
		const documents = await this.documentRepo.find({
			where: { id: In(ids) },
		});

		if (documents.length !== ids.length)
			throw new NotFoundException('trusted or not found documents');

		return documents;
	}

	async create(
		token: PayloadToken,
		document: Express.Multer.File,
		data: CreateDocumentDto,
	) {
		const user = await this.usersService.findUserById(token.sub);
		const newDocument = this.documentRepo.create({
			user,
			filename: document.filename,
			originalname: document.originalname,
			digitalSignature: data.digitalSignature,
		});

		return await this.documentRepo.save(newDocument);
	}

	async getUserDocuments(token: PayloadToken) {
		const documents = await this.documentRepo.find({
			where: { user: { id: token.sub } },
		});

		return documents;
	}

	async downloadDocument(filename: string) {
		await this.findByFilename(filename);
		const path = join(process.cwd(), `public/documents/${filename}`);
		const file = createReadStream(path);
		return new StreamableFile(file);
	}
}
