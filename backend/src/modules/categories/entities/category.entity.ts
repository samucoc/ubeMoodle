import { Entity, Column, OneToMany, Tree, TreeChildren, TreeParent } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Course } from '../../courses/entities/course.entity';

@Entity('categories')
@Tree('materialized-path')
export class Category extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'id_number', type: 'varchar', length: 100, nullable: true })
  idNumber: string | null;

  @Column({ name: 'is_visible', default: true })
  isVisible: boolean;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'course_count', default: 0 })
  courseCount: number;

  @Column({ name: 'icon_url', type: 'varchar', length: 500, nullable: true })
  iconUrl: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  color: string | null;

  @TreeChildren()
  children: Category[];

  @TreeParent()
  parent: Category | null;

  @OneToMany(() => Course, (course) => course.category)
  courses: Course[];
}
