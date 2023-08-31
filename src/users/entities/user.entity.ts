import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToMany,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Document } from '../../documents/entities/document.entity';
import { Group } from '../../groups/entities/groups.entity';

@Entity({ name: 'users' })
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Exclude()
	@Column({ type: 'varchar', length: 255 })
	password?: string;

	@Column({ type: 'varchar', length: 255 })
	email: string;

	@Column({ type: 'text', name: 'public_key' })
	publicKey: string;

	@Column({ type: 'varchar', length: 255, name: 'first_name' })
	firstName: string;

	@Column({ type: 'varchar', length: 255, name: 'last_name' })
	lastName: string;

	@Exclude()
	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@Exclude()
	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;

	@OneToMany(() => Document, (document) => document.user)
	documents: Document[];

	@ManyToMany(() => Group, (group) => group.users)
	groups: Group[];
}
