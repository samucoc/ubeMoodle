import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, MessageStatus } from './entities/message.entity';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { sanitizeSortBy, sanitizeSortOrder } from '../../common/utils/query-sanitizer';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async send(data: {
    senderId: string;
    recipientId: string;
    subject?: string;
    body: string;
    bodyFormat?: string;
    contextUrl?: string;
    attachments?: string[];
  }): Promise<Message> {
    const message = this.messageRepository.create({
      ...data,
      status: MessageStatus.SENT,
    });
    const saved = await this.messageRepository.save(message);
    this.logger.log(`Message sent from ${data.senderId} to ${data.recipientId}`);
    return saved;
  }

  async findById(id: string, userId: string): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id },
      relations: ['sender', 'recipient'],
    });
    if (!message) {
      throw new NotFoundException(`Message with ID "${id}" not found`);
    }
    if (message.senderId !== userId && message.recipientId !== userId) {
      throw new ForbiddenException('You do not have access to this message');
    }
    return message;
  }

  async getInbox(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Message>> {
    const { page = 1, limit = 20, search, sortBy, sortOrder } = paginationDto;

    const safeSortBy = sanitizeSortBy('message', sortBy, 'createdAt');
    const safeSortOrder = sanitizeSortOrder(sortOrder);

    const qb = this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .where('message.recipientId = :userId', { userId })
      .andWhere('message.recipientDeleted = :deleted', { deleted: false });

    if (search) {
      qb.andWhere(
        '(message.subject ILIKE :search OR message.body ILIKE :search OR sender.firstName ILIKE :search OR sender.lastName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy(`message.${safeSortBy}`, safeSortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  async getSent(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Message>> {
    const { page = 1, limit = 20, search, sortBy, sortOrder } = paginationDto;

    const safeSortBy = sanitizeSortBy('message', sortBy, 'createdAt');
    const safeSortOrder = sanitizeSortOrder(sortOrder);

    const qb = this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.recipient', 'recipient')
      .where('message.senderId = :userId', { userId })
      .andWhere('message.senderDeleted = :deleted', { deleted: false });

    if (search) {
      qb.andWhere(
        '(message.subject ILIKE :search OR message.body ILIKE :search OR recipient.firstName ILIKE :search OR recipient.lastName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy(`message.${safeSortBy}`, safeSortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  async getConversation(
    userId: string,
    otherUserId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Message>> {
    const { page = 1, limit = 20, sortOrder = 'DESC' } = paginationDto;

    const qb = this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.recipient', 'recipient')
      .where(
        '((message.senderId = :userId AND message.recipientId = :otherUserId) OR (message.senderId = :otherUserId AND message.recipientId = :userId))',
        { userId, otherUserId },
      )
      .andWhere(
        '((message.senderId = :userId AND message.senderDeleted = false) OR (message.recipientId = :userId AND message.recipientDeleted = false))',
        { userId },
      );

    qb.orderBy('message.createdAt', sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  async getConversations(userId: string): Promise<
    {
      userId: string;
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
      lastMessage: string;
      lastMessageDate: Date;
      unreadCount: number;
    }[]
  > {
    const conversations = await this.messageRepository
      .createQueryBuilder('message')
      .select('CASE WHEN message.sender_id = :userId THEN message.recipient_id ELSE message.sender_id END', 'otherUserId')
      .addSelect('MAX(message.created_at)', 'lastMessageDate')
      .where('(message.sender_id = :userId OR message.recipient_id = :userId)', { userId })
      .andWhere(
        '((message.sender_id = :userId AND message.sender_deleted = false) OR (message.recipient_id = :userId AND message.recipient_deleted = false))',
      )
      .groupBy('"otherUserId"')
      .orderBy('"lastMessageDate"', 'DESC')
      .setParameter('userId', userId)
      .getRawMany();

    return conversations;
  }

  async markAsRead(id: string, userId: string): Promise<Message> {
    const message = await this.messageRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException(`Message with ID "${id}" not found`);
    }
    if (message.recipientId !== userId) {
      throw new ForbiddenException('You can only mark your own messages as read');
    }
    message.status = MessageStatus.READ;
    message.readAt = new Date();
    return this.messageRepository.save(message);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ status: MessageStatus.READ, readAt: new Date() })
      .where('recipientId = :userId', { userId })
      .andWhere('status != :status', { status: MessageStatus.READ })
      .execute();
  }

  async deleteForUser(id: string, userId: string): Promise<void> {
    const message = await this.messageRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException(`Message with ID "${id}" not found`);
    }

    if (message.senderId === userId) {
      message.senderDeleted = true;
    }
    if (message.recipientId === userId) {
      message.recipientDeleted = true;
    }

    if (message.senderId !== userId && message.recipientId !== userId) {
      throw new ForbiddenException('You do not have access to this message');
    }

    // If both sender and recipient deleted, soft-delete the record
    if (message.senderDeleted && message.recipientDeleted) {
      await this.messageRepository.softRemove(message);
    } else {
      await this.messageRepository.save(message);
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.messageRepository.count({
      where: {
        recipientId: userId,
        status: MessageStatus.SENT,
        recipientDeleted: false,
      },
    });
  }
}
