import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';
import { Activity } from '../../activities/entities/activity.entity';

export enum GradeStatus {
  PENDING = 'pending',
  GRADED = 'graded',
  RELEASED = 'released',
}

@Entity('grades')
@Unique(['userId', 'activityId'])
export class Grade extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @ManyToOne(() => Activity, (activity) => activity.grades, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activity_id' })
  activity: Activity;

  @Column({ name: 'activity_id' })
  @Index()
  activityId: string;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column({ name: 'course_id' })
  courseId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  grade: number | null;

  @Column({ name: 'max_grade', type: 'decimal', precision: 10, scale: 2 })
  maxGrade: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  percentage: number | null;

  @Column({ name: 'letter_grade', type: 'varchar', length: 5, nullable: true })
  letterGrade: string | null;

  @Column({
    type: 'enum',
    enum: GradeStatus,
    default: GradeStatus.PENDING,
  })
  status: GradeStatus;

  @Column({ type: 'text', nullable: true })
  feedback: string | null;

  @Column({ name: 'graded_by', nullable: true })
  gradedBy: string | null;

  @Column({ name: 'graded_at', type: 'timestamptz', nullable: true })
  gradedAt: Date | null;

  @Column({ name: 'submitted_at', type: 'timestamptz', nullable: true })
  submittedAt: Date | null;

  @Column({ name: 'attempt_number', type: 'int', default: 1 })
  attemptNumber: number;

  @Column({ name: 'submission_data', type: 'jsonb', nullable: true })
  submissionData: Record<string, any> | null;
}
