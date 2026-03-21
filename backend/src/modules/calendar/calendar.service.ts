import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { CalendarEvent } from './entities/calendar-event.entity';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { sanitizeSortBy, sanitizeSortOrder } from '../../common/utils/query-sanitizer';

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(
    @InjectRepository(CalendarEvent)
    private readonly eventRepository: Repository<CalendarEvent>,
  ) {}

  async create(data: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const event = this.eventRepository.create(data);
    const saved = await this.eventRepository.save(event);
    this.logger.log(`Calendar event created: ${saved.title} (${saved.id})`);
    return saved;
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<CalendarEvent>> {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy,
      sortOrder,
    } = paginationDto;

    const safeSortBy = sanitizeSortBy('calendar', sortBy, 'startTime');
    const safeSortOrder = sanitizeSortOrder(sortOrder) === 'DESC' ? 'DESC' : 'ASC';

    const qb = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.user', 'user')
      .leftJoinAndSelect('event.course', 'course');

    if (search) {
      qb.andWhere(
        '(event.title ILIKE :search OR event.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy(`event.${safeSortBy}`, safeSortOrder)
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

  async findById(id: string): Promise<CalendarEvent> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['user', 'course'],
    });
    if (!event) {
      throw new NotFoundException(`Calendar event with ID "${id}" not found`);
    }
    return event;
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    userId?: string,
    courseId?: string,
  ): Promise<CalendarEvent[]> {
    const qb = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.user', 'user')
      .leftJoinAndSelect('event.course', 'course')
      .where('event.startTime >= :startDate', { startDate })
      .andWhere('event.startTime <= :endDate', { endDate });

    if (userId) {
      qb.andWhere('(event.userId = :userId OR event.userId IS NULL)', { userId });
    }

    if (courseId) {
      qb.andWhere('event.courseId = :courseId', { courseId });
    }

    qb.andWhere('event.isVisible = :isVisible', { isVisible: true });
    qb.orderBy('event.startTime', 'ASC');

    return qb.getMany();
  }

  async findByUser(userId: string): Promise<CalendarEvent[]> {
    return this.eventRepository.find({
      where: [{ userId }, { userId: null as any, eventType: 'site' as any }],
      relations: ['course'],
      order: { startTime: 'ASC' },
    });
  }

  async findByCourse(courseId: string): Promise<CalendarEvent[]> {
    return this.eventRepository.find({
      where: { courseId },
      order: { startTime: 'ASC' },
    });
  }

  async getUpcoming(userId: string, limit = 10): Promise<CalendarEvent[]> {
    return this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.course', 'course')
      .where('event.startTime >= :now', { now: new Date() })
      .andWhere('(event.userId = :userId OR event.userId IS NULL)', { userId })
      .andWhere('event.isVisible = :isVisible', { isVisible: true })
      .orderBy('event.startTime', 'ASC')
      .take(limit)
      .getMany();
  }

  async update(id: string, data: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const event = await this.findById(id);
    Object.assign(event, data);
    return this.eventRepository.save(event);
  }

  async remove(id: string): Promise<void> {
    const event = await this.findById(id);
    await this.eventRepository.softRemove(event);
    this.logger.log(`Calendar event soft-deleted: ${event.title} (${id})`);
  }
}
