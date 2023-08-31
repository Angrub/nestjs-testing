import { faker } from '@faker-js/faker';
import { DeepPartial } from 'typeorm';
import { Group } from '../entities/groups.entity';
import { DocumentMock } from '../../documents/mocks/document.mock';
import { UserMock } from '../../users/mocks/user.mock';

export class GroupMock {
	public _findMethodResult: Group[];
	public _findOneMethodResult: Group;
	public createMethodResult: Group;
	public _saveMethodResult: Group;
	private documentMock: DocumentMock;
	private userMock: UserMock;
	private omitPipe: boolean;

	constructor(omitPipe = false) {
		this.omitPipe = omitPipe;
		this.documentMock = new DocumentMock(omitPipe);
		this.userMock = new UserMock(omitPipe);
	}

	generateGroup(data?: GenerateUserParams) {
		// create
		const group = new Group();

		if (data) {
			group.id = data.id;
			group.name = data.name;
		}
		// generate
		group.id = group.id ?? faker.number.int({ min: 0, max: 255 });
		group.name = group.name ?? faker.company.name();
		group.createdAt = faker.date.anytime();
		group.updatedAt = faker.date.anytime();

		// return
		return group;
	}

	find() {
		const groups = faker.helpers.multiple(this.generateGroup, {
			count: { min: 0, max: 20 },
		});

		this._findMethodResult = groups.map((group) => ({ ...group }));
		return Promise.resolve(groups);
	}

	async findOne(options: FindOneOptions) {
		const group = this.generateGroup({ id: options.where.id });
		if (options.relations.documents) {
			group.documents = await this.documentMock.find();
		}

		if (options.relations.users) {
			group.users = await this.userMock.find();
		}

		this._findOneMethodResult = { ...group };
		this._findOneMethodResult.users = this.userMock.findMethodResult;
		this._findOneMethodResult.documents =
			this.documentMock.findMethodResult;
		return Promise.resolve(group);
	}

	create(enityLike: DeepPartial<Group>) {
		const group = new Group();
		group.name = enityLike.name;
		this.createMethodResult = { ...group };

		return group;
	}

	save(entity: Group) {
		entity.id = faker.number.int({ min: 0, max: 255 });
		entity.createdAt = faker.date.anytime();
		entity.updatedAt = faker.date.anytime();
		this._saveMethodResult = {
			...entity,
			users: entity.users
				? entity.users.map((user) => ({ ...user }))
				: undefined,
			documents: entity.documents
				? entity.documents.map((document) => ({ ...document }))
				: undefined,
		};

		return Promise.resolve(entity);
	}

	get findMethodResult() {
		if (this.omitPipe && this._findMethodResult) {
			const value = this._findMethodResult.map((group) => {
				delete group.createdAt;
				delete group.updatedAt;

				return group;
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

			if (value.users) {
				value.users = value.users.map((user) => {
					delete user.createdAt;
					delete user.updatedAt;
					delete user.password;

					return user;
				});
			}

			if (value.documents) {
				value.documents = value.documents.map((document) => {
					delete document.createdAt;
					delete document.updatedAt;

					return document;
				});
			}

			return value;
		}

		return this._saveMethodResult;
	}
}

interface GenerateUserParams {
	id?: number;
	name?: string;
}

interface FindOneOptions {
	relations: {
		users?: boolean;
		documents?: boolean;
	};
	where: {
		id: number;
	};
}
