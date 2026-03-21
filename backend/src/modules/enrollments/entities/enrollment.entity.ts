import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';

export enum EnrollmentStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
}

export enum EnrollmentRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  TEACHING_ASSISTANT = 'teaching_assistant',
}

@Entity('enrollments')
@Unique(['userId', 'courseId'])
export class Enrollment extends BaseEntity {
  @ManyToOne(() => User, (user) => user.enrollments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @ManyToOne(() => Course, (course) => course.enrollments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column({ name: 'course_id' })
  @Index()
  courseId: string;

  @Column({
    type: 'enum',
    enum: EnrollmentRole,
    default: EnrollmentRole.STUDENT,
  })
  role: EnrollmentRole;

  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ACTIVE,
  })
  status: EnrollmentStatus;

  @Column({ name: 'enrolled_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  enrolledAt: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progress: number;

  @Column({ name: 'last_accessed', type: 'timestamptz', nullable: true })
  lastAccessed: Date | null;

  @Column({ name: 'time_spent', type: 'int', default: 0, comment: 'Time spent in seconds' })
  timeSpent: number;
}
