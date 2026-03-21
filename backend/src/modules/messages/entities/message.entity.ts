import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

@Entity('messages')
export class Message extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ name: 'sender_id' })
  @Index()
  senderId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;

  @Column({ name: 'recipient_id' })
  @Index()
  recipientId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subject: string | null;

  @Column({ type: 'text' })
  body: string;

  @Column({ name: 'body_format', type: 'varchar', length: 20, default: 'plain' })
  bodyFormat: string;

  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.SENT,
  })
  status: MessageStatus;

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt: Date | null;

  @Column({ name: 'is_notification', default: false })
  isNotification: boolean;

  @Column({ name: 'context_url', type: 'varchar', length: 500, nullable: true })
  contextUrl: string | null;

  @Column({ type: 'jsonb', nullable: true, default: '[]' })
  attachments: string[];

  @Column({ name: 'sender_deleted', default: false })
  senderDeleted: boolean;

  @Column({ name: 'recipient_deleted', default: false })
  recipientDeleted: boolean;
}
