import {
	Body,
	Controller,
	FileTypeValidator,
	Get,
	Header,
	Param,
	ParseFilePipe,
	Post,
	Request,
	StreamableFile,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { DocumentsService } from '../services/documents.service';
import { JwtGuard } from '../../users/guards/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { generateStorage } from '../../helpers/diskstorage';
import { CreateDocumentDto } from '../dtos/document.dto';

@UseGuards(JwtGuard)
@Controller('documents')
export class DocumentsController {
	constructor(private documentsService: DocumentsService) {}

	@Get('/')
	list() {
		return this.documentsService.list();
	}

	@Get('/my_documents')
	getByUser(@Request() req) {
		return this.documentsService.getUserDocuments(req.user);
	}

	@Post('/')
	@UseInterceptors(
		FileInterceptor('document', {
			storage: generateStorage('public/documents'),
		}),
	)
	create(
		@Request() req,
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new FileTypeValidator({ fileType: 'application/pdf' }),
				],
			}),
		)
		document: Express.Multer.File,
		@Body() data: CreateDocumentDto,
	) {
		return this.documentsService.create(req.user, document, data);
	}

	@Get('/download/:filename')
	@Header('Content-Type', 'application/pdf')
	@Header('Content-Disposition', 'attachment')
	async getStaticFile(
		@Param('filename') filename: string,
	): Promise<StreamableFile> {
		return this.documentsService.downloadDocument(filename);
	}
}
