import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToMany,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { User } from '../../users/entities/user.entity';
import { Group } from '../../groups/entities/groups.entity';

@Entity({ name: 'documents' })
export class Document {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (user) => user.documents)
	@JoinColumn({ name: 'user_id' })
	user: User;

	@Column({ type: 'varchar', length: 255 })
	filename: string;

	@Column({ type: 'varchar', length: 255 })
	originalname: string;

	@Column({ type: 'varchar', length: 255, name: 'digital_signature' })
	digitalSignature: string;

	@Exclude()
	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@Exclude()
	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;

	@ManyToMany(() => Group, (group) => group.documents)
	groups: Group[];
}
