import { Module } from '@nestjs/common';
import { DocumentsService } from './services/documents.service';
import { DocumentsController } from './controllers/documents.controller';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Document]), UsersModule],
	providers: [DocumentsService],
	controllers: [DocumentsController],
	exports: [DocumentsService],
})
export class DocumentsModule {}
