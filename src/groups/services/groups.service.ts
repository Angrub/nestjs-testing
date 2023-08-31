import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from '../entities/groups.entity';
import { Repository } from 'typeorm';
import {
	AddDocumentDto,
	AddUsersDto,
	CreateGroupDto,
} from '../dtos/groups.dto';
import { UsersService } from '../../users/services/users.service';
import { DocumentsService } from '../../documents/services/documents.service';
import { httpErrors } from '../../helpers/http-errors.helper';

@Injectable()
export class GroupsService {
	constructor(
		@InjectRepository(Group)
		private groupRepo: Repository<Group>,
		private usersService: UsersService,
		private documentsService: DocumentsService,
	) {}

	async list() {
		return await this.groupRepo.find();
	}

	async findOne(id: number) {
		const group = await this.groupRepo.findOne({
			relations: { users: true, documents: true },
			where: { id },
		});

		if (!group) throw httpErrors.notFoundError('Group', id);

		return group;
	}

	async findOneWithUsers(id: number) {
		const group = await this.groupRepo.findOne({
			relations: { users: true },
			where: { id },
		});

		if (!group) throw httpErrors.notFoundError('Group', id);

		return group;
	}

	async findOneWithDocuments(id: number) {
		const group = await this.groupRepo.findOne({
			relations: { documents: true },
			where: { id },
		});

		if (!group) throw httpErrors.notFoundError('Group', id);

		return group;
	}

	async create(data: CreateGroupDto) {
		const users = await this.usersService.findByIds(data.userIds);
		const newGroup = this.groupRepo.create(data);
		newGroup.users = users;

		return this.groupRepo.save(newGroup);
	}

	async addUsers(groupId: number, data: AddUsersDto) {
		const group = await this.findOne(groupId);
		const users = await this.usersService.findByIds(data.userIds);
		group.users = group.users.concat(users);

		return this.groupRepo.save(group);
	}

	async addDocuments(groupId: number, data: AddDocumentDto) {
		const group = await this.findOne(groupId);
		const documents = await this.documentsService.findByIds(
			data.documentIds,
		);
		group.documents = group.documents.concat(documents);

		return this.groupRepo.save(group);
	}
}
