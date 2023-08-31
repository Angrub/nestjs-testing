import { Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { config } from 'src/config';

@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			inject: [config.KEY],
			useFactory: (configService: ConfigType<typeof config>) => {
				const { host, port, username, password, database } =
					configService.database;
				return <TypeOrmModuleAsyncOptions>{
					type: 'postgres',
					host,
					port,
					username,
					password,
					database,
					synchronize: false,
					autoLoadEntities: true,
				};
			},
		}),
	],
	exports: [TypeOrmModule],
})
export class DatabaseModule {}
