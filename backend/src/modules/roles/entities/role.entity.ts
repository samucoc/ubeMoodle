import { Entity, Column, ManyToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { RoleType } from '../enums/role-type.enum';

@Entity('roles')
export class Role extends BaseEntity {
  @Column({
    type: 'enum',
    enum: RoleType,
    unique: true,
  })
  name: RoleType;

  @Column({ type: 'varchar', length: 255 })
  displayName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', default: '[]' })
  permissions: string[];

  @Column({ name: 'is_system', default: true })
  isSystem: boolean;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;
}
