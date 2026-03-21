import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './entities/activity.entity';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { sanitizeSortBy, sanitizeSortOrder } from '../../common/utils/query-sanitizer';

@Injectable()
export class ActivitiesService {
  private readonly logger = new Logger(ActivitiesService.name);

  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
  ) {}

  async create(data: Partial<Activity>): Promise<Activity> {
    const activity = this.activityRepository.create(data);
    const saved = await this.activityRepository.save(activity);
    this.logger.log(`Activity created: ${saved.name} (${saved.id}) in course ${saved.courseId}`);
    return saved;
  }

  async findAll(paginationDto: PaginationDto & { courseId?: string }): Promise<PaginatedResult<Activity>> {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy,
      sortOrder,
    } = paginationDto;

    const safeSortBy = sanitizeSortBy('activity', sortBy, 'section');
    const safeSortOrder = sanitizeSortOrder(sortOrder);

    const qb = this.activityRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.course', 'course');

    if (paginationDto.courseId) {
      qb.andWhere('activity.courseId = :courseId', {
        courseId: paginationDto.courseId,
      });
    }

    if (search) {
      qb.andWhere(
        '(activity.name ILIKE :search OR activity.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('activity.section', 'ASC')
      .addOrderBy('activity.sortOrder', 'ASC');

    if (safeSortBy !== 'section') {
      qb.addOrderBy(`activity.${safeSortBy}`, safeSortOrder);
    }

    qb.skip((page - 1) * limit).take(limit);

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

  async findById(id: string): Promise<Activity> {
    const activity = await this.activityRepository.findOne({
      where: { id },
      relations: ['course', 'grades'],
    });
    if (!activity) {
      throw new NotFoundException(`Activity with ID "${id}" not found`);
    }
    return activity;
  }

  async findByCourse(courseId: string): Promise<Activity[]> {
    return this.activityRepository.find({
      where: { courseId },
      order: { section: 'ASC', sortOrder: 'ASC' },
    });
  }

  async update(id: string, data: Partial<Activity>): Promise<Activity> {
    const activity = await this.findById(id);
    Object.assign(activity, data);
    return this.activityRepository.save(activity);
  }

  async remove(id: string): Promise<void> {
    const activity = await this.findById(id);
    await this.activityRepository.softRemove(activity);
    this.logger.log(`Activity soft-deleted: ${activity.name} (${id})`);
  }

  async reorder(
    courseId: string,
    items: { id: string; section: number; sortOrder: number }[],
  ): Promise<void> {
    const promises = items.map((item) =>
      this.activityRepository.update(item.id, {
        section: item.section,
        sortOrder: item.sortOrder,
      }),
    );
    await Promise.all(promises);
    this.logger.log(`Activities reordered for course ${courseId}`);
  }
}
