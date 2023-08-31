import {
	Column,
	CreateDateColumn,
	Entity,
	JoinTable,
	ManyToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { User } from '../../users/entities/user.entity';
import { Document } from '../../documents/entities/document.entity';

@Entity({ name: 'Groups' })
export class Group {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'varchar', length: 255 })
	name: string;

	@Exclude()
	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@Exclude()
	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;

	@ManyToMany(() => User, (user) => user.groups, { cascade: true })
	@JoinTable({
		name: 'group_users',
		joinColumn: {
			name: 'group_id',
		},
		inverseJoinColumn: {
			name: 'user_id',
		},
	})
	users: User[];

	@ManyToMany(() => Document, (document) => document.groups, {
		cascade: true,
	})
	@JoinTable({
		name: 'group_documents',
		joinColumn: {
			name: 'group_id',
		},
		inverseJoinColumn: {
			name: 'document_id',
		},
	})
	documents: Document[];
}
