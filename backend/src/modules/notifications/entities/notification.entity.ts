import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  GRADE = 'grade',
  MESSAGE = 'message',
  ENROLLMENT = 'enrollment',
  COURSE_UPDATE = 'course_update',
  ASSIGNMENT = 'assignment',
  REMINDER = 'reminder',
  SYSTEM = 'system',
}

@Entity('notifications')
export class Notification extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.SYSTEM,
  })
  type: NotificationType;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'jsonb', nullable: true, default: '{}' })
  data: Record<string, any>;

  @Column({ name: 'is_read', default: false })
  @Index()
  isRead: boolean;

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt: Date | null;

  @Column({ name: 'related_user_id', nullable: true })
  relatedUserId: string | null;

  @Column({ name: 'action_url', type: 'varchar', length: 500, nullable: true })
  actionUrl: string | null;
}
