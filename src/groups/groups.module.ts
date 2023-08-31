import { Module } from '@nestjs/common';
import { GroupsService } from './services/groups.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/groups.entity';
import { UsersModule } from 'src/users/users.module';
import { DocumentsModule } from 'src/documents/documents.module';
import { GroupsController } from './controllers/groups.controller';

@Module({
	imports: [TypeOrmModule.forFeature([Group]), UsersModule, DocumentsModule],
	providers: [GroupsService],
	controllers: [GroupsController],
})
export class GroupsModule {}
