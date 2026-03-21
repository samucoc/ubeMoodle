import { Entity, Column, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Course } from '../../courses/entities/course.entity';
import { Grade } from '../../grades/entities/grade.entity';

export enum ActivityType {
  ASSIGNMENT = 'assignment',
  QUIZ = 'quiz',
  FORUM = 'forum',
  RESOURCE = 'resource',
  URL = 'url',
  PAGE = 'page',
  LABEL = 'label',
  FOLDER = 'folder',
  VIDEO = 'video',
  SCORM = 'scorm',
  LESSON = 'lesson',
  WORKSHOP = 'workshop',
  WIKI = 'wiki',
  GLOSSARY = 'glossary',
  SURVEY = 'survey',
  CHOICE = 'choice',
  FEEDBACK = 'feedback',
  H5P = 'h5p',
}

@Entity('activities')
export class Activity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: ActivityType,
  })
  @Index()
  type: ActivityType;

  @Column({ type: 'int', default: 0 })
  section: number;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_visible', default: true })
  isVisible: boolean;

  @Column({ name: 'max_grade', type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxGrade: number | null;

  @Column({ name: 'pass_grade', type: 'decimal', precision: 10, scale: 2, nullable: true })
  passGrade: number | null;

  @Column({ name: 'due_date', type: 'timestamptz', nullable: true })
  dueDate: Date | null;

  @Column({ name: 'available_from', type: 'timestamptz', nullable: true })
  availableFrom: Date | null;

  @Column({ name: 'available_until', type: 'timestamptz', nullable: true })
  availableUntil: Date | null;

  @Column({ name: 'allow_late_submission', default: false })
  allowLateSubmission: boolean;

  @Column({ name: 'max_attempts', type: 'int', nullable: true })
  maxAttempts: number | null;

  @Column({ name: 'time_limit', type: 'int', nullable: true, comment: 'Time limit in minutes' })
  timeLimit: number | null;

  @Column({ type: 'jsonb', nullable: true, default: '{}' })
  settings: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true, default: '{}' })
  content: Record<string, any>;

  @Column({ name: 'file_urls', type: 'jsonb', nullable: true, default: '[]' })
  fileUrls: string[];

  // Relations
  @ManyToOne(() => Course, (course) => course.activities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column({ name: 'course_id' })
  courseId: string;

  @OneToMany(() => Grade, (grade) => grade.activity)
  grades: Grade[];
}
