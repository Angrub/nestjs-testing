import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { config } from './config';
import { ConfigModule } from '@nestjs/config';
import { enviromentSchema, enviroments } from './enviroment';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { DocumentsModule } from './documents/documents.module';
import { GroupsModule } from './groups/groups.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			envFilePath: enviroments[process.env.NODE_ENV],
			load: [config],
			isGlobal: true,
			validationSchema: enviromentSchema,
		}),
		DatabaseModule,
		UsersModule,
		DocumentsModule,
		GroupsModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
