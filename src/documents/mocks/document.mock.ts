import { faker } from '@faker-js/faker';
import { DeepPartial } from 'typeorm';
import { Document } from '../entities/document.entity';
import { User } from '../../users/entities/user.entity';

export class DocumentMock {
	private _findMethodResult: Document[];
	private _findOneMethodResult: Document;
	public createMethodResult: Document;
	private _saveMethodResult: Document;
	private omitPipe: boolean;

	constructor(omitPipe = false) {
		this.omitPipe = omitPipe;
	}

	generateDocument(data?: GenerateUserParams) {
		// create
		const document = new Document();

		if (data) {
			document.id = data.id;
			document.user = data.user;
			document.filename = data.filename;
			document.originalname = data.originalname;
			document.digitalSignature = data.digitalSignature;
		}
		// generate
		document.id = document.id ?? faker.number.int({ min: 0, max: 255 });
		document.filename = document.filename ?? faker.system.fileName();
		document.originalname =
			document.originalname ?? faker.system.fileName();
		document.digitalSignature =
			document.digitalSignature ??
			faker.string.alphanumeric({
				length: { min: 200, max: 255 },
			});
		document.createdAt = faker.date.anytime();
		document.updatedAt = faker.date.anytime();

		// return
		return document;
	}

	find(options?: FindOptions) {
		let documents: Document[] = [];
		if (options) {
			if (options.where.id) {
				const ids = options.where.id;
				ids.forEach((id) =>
					documents.push(this.generateDocument({ id })),
				);
				this._findMethodResult = documents.map((doc) => ({ ...doc }));
				return Promise.resolve(documents);
			}
		}

		documents = faker.helpers.multiple(this.generateDocument, {
			count: { min: 0, max: 20 },
		});

		this._findMethodResult = documents.map((doc) => ({ ...doc }));
		return Promise.resolve(documents);
	}

	findOne(options?: FindOneOptions) {
		let documents: Document;
		if (options) {
			documents = this.generateDocument({
				filename: options.where.filename,
			});
		}

		this._findOneMethodResult = { ...documents };
		return Promise.resolve(documents);
	}

	create(enityLike: DeepPartial<Document>) {
		const document = new Document();
		document.filename = enityLike.filename;
		document.originalname = enityLike.originalname;
		document.digitalSignature = enityLike.digitalSignature;
		this.createMethodResult = { ...document };

		return document;
	}

	save(entity: Document) {
		entity.id = faker.number.int({ min: 0, max: 255 });
		entity.createdAt = faker.date.anytime();
		entity.updatedAt = faker.date.anytime();
		this._saveMethodResult = { ...entity };

		return Promise.resolve(entity);
	}

	get findMethodResult() {
		if (this.omitPipe && this._findMethodResult) {
			const value = this._findMethodResult.map((document) => {
				delete document.createdAt;
				delete document.updatedAt;

				return document;
			});
			return value;
		}

		return this._findMethodResult;
	}
	get findOneMethodResult() {
		if (this.omitPipe && this._findOneMethodResult) {
			const value = { ...this._findOneMethodResult };
			delete value.createdAt;
			delete value.updatedAt;

			return value;
		}

		return this._findOneMethodResult;
	}
	get saveMethodResult() {
		if (this.omitPipe && this._saveMethodResult) {
			const value = { ...this._saveMethodResult };
			delete value.createdAt;
			delete value.updatedAt;
			delete value.user.createdAt;
			delete value.user.updatedAt;
			delete value.user.password;

			return value;
		}

		return this._saveMethodResult;
	}
}

interface GenerateUserParams {
	id?: number;
	user?: User;
	filename?: string;
	originalname?: string;
	digitalSignature?: string;
}

interface FindOptions {
	where: {
		id?: number[];
		user?: {
			id: number;
		};
	};
}

interface FindOneOptions {
	where: {
		filename?: string;
	};
}
