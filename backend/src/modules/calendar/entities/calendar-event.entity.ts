import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Course } from '../../courses/entities/course.entity';

export enum EventType {
  COURSE = 'course',
  ASSIGNMENT = 'assignment',
  QUIZ = 'quiz',
  USER = 'user',
  SITE = 'site',
  EXAM = 'exam',
  HOLIDAY = 'holiday',
}

export enum EventRepeat {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

@Entity('calendar_events')
export class CalendarEvent extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: EventType,
    default: EventType.USER,
  })
  @Index()
  eventType: EventType;

  @Column({ name: 'start_time', type: 'timestamptz' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamptz', nullable: true })
  endTime: Date | null;

  @Column({ name: 'all_day', default: false })
  allDay: boolean;

  @Column({
    type: 'enum',
    enum: EventRepeat,
    default: EventRepeat.NONE,
  })
  repeat: EventRepeat;

  @Column({ name: 'repeat_until', type: 'timestamptz', nullable: true })
  repeatUntil: Date | null;

  @Column({ type: 'varchar', length: 50, default: '#3788d8' })
  color: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  location: string | null;

  @Column({ name: 'is_visible', default: true })
  isVisible: boolean;

  // Relations
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ name: 'user_id', nullable: true })
  userId: string | null;

  @ManyToOne(() => Course, { nullable: true })
  @JoinColumn({ name: 'course_id' })
  course: Course | null;

  @Column({ name: 'course_id', nullable: true })
  courseId: string | null;
}
