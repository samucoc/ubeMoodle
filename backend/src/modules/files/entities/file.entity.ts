import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('files')
export class FileEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  filename: string;

  @Column({ name: 'original_name', type: 'varchar', length: 500 })
  originalName: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 255 })
  mimeType: string;

  @Column({ type: 'bigint' })
  size: number;

  @Column({ type: 'varchar', length: 1000 })
  path: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  hash: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  context: string | null;

  @Column({ name: 'context_id', type: 'varchar', nullable: true })
  contextId: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'uploaded_by' })
  uploadedByUser: User | null;

  @Column({ name: 'uploaded_by', nullable: true })
  @Index()
  uploadedBy: string | null;
}
