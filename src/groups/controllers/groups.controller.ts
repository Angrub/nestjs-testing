import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Put,
	Request,
	UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../../users/guards/jwt.guard';
import { GroupsService } from '../services/groups.service';
import {
	AddDocumentDto,
	AddUsersDto,
	CreateGroupDto,
} from '../dtos/groups.dto';

@UseGuards(JwtGuard)
@Controller('groups')
export class GroupsController {
	constructor(private groupsService: GroupsService) {}

	@Get('/')
	list() {
		return this.groupsService.list();
	}

	@Get('/users/:id')
	findWithUsers(@Param('id', ParseIntPipe) id: number) {
		return this.groupsService.findOneWithUsers(id);
	}

	@Get('/documents/:id')
	findWithDocuments(@Param('id', ParseIntPipe) id: number) {
		return this.groupsService.findOneWithDocuments(id);
	}

	@Post('/')
	create(@Request() req, @Body() data: CreateGroupDto) {
		return this.groupsService.create(data);
	}

	@Put('/users/:id')
	addUsers(@Param('id', ParseIntPipe) id: number, @Body() data: AddUsersDto) {
		return this.groupsService.addUsers(id, data);
	}

	@Put('/documents/:id')
	addDocuments(
		@Param('id', ParseIntPipe) id: number,
		@Body() data: AddDocumentDto,
	) {
		return this.groupsService.addDocuments(id, data);
	}
}
