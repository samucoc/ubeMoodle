import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Category } from '../../categories/entities/category.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { Activity } from '../../activities/entities/activity.entity';
import { User } from '../../users/entities/user.entity';

export enum CourseFormat {
  TOPICS = 'topics',
  WEEKS = 'weeks',
  SINGLE = 'single',
  SOCIAL = 'social',
}

export enum CourseVisibility {
  VISIBLE = 'visible',
  HIDDEN = 'hidden',
}

@Entity('courses')
export class Course extends BaseEntity {
  @Column({ name: 'full_name', type: 'varchar', length: 255 })
  fullName: string;

  @Column({ name: 'short_name', type: 'varchar', length: 100, unique: true })
  @Index()
  shortName: string;

  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @Column({ name: 'summary_format', default: 'html' })
  summaryFormat: string;

  @Column({
    type: 'enum',
    enum: CourseFormat,
    default: CourseFormat.TOPICS,
  })
  format: CourseFormat;

  @Column({
    type: 'enum',
    enum: CourseVisibility,
    default: CourseVisibility.VISIBLE,
  })
  visibility: CourseVisibility;

  @Column({ name: 'start_date', type: 'timestamptz', nullable: true })
  startDate: Date | null;

  @Column({ name: 'end_date', type: 'timestamptz', nullable: true })
  endDate: Date | null;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @Column({ name: 'max_students', type: 'int', default: 0 })
  maxStudents: number;

  @Column({ name: 'self_enrollment', default: false })
  selfEnrollment: boolean;

  @Column({ name: 'enrollment_key', type: 'varchar', length: 100, nullable: true })
  enrollmentKey: string | null;

  @Column({ name: 'num_sections', type: 'int', default: 10 })
  numSections: number;

  @Column({ name: 'show_grades', default: true })
  showGrades: boolean;

  @Column({ name: 'show_reports', default: false })
  showReports: boolean;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ type: 'jsonb', nullable: true, default: '{}' })
  settings: Record<string, any>;

  // Relations
  @ManyToOne(() => Category, (category) => category.courses, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: Category | null;

  @Column({ name: 'category_id', nullable: true })
  categoryId: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @Column({ name: 'creator_id' })
  creatorId: string;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
  enrollments: Enrollment[];

  @OneToMany(() => Activity, (activity) => activity.course)
  activities: Activity[];
}
