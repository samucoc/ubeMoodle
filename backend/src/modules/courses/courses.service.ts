import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { sanitizeSortBy, sanitizeSortOrder } from '../../common/utils/query-sanitizer';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  private async invalidateCourseCache(): Promise<void> {
    // Invalidate known cache keys
    try {
      await this.cacheManager.del('courses:stats');
    } catch { /* cache may not support del */ }
  }

  async create(createCourseDto: CreateCourseDto, creatorId: string): Promise<Course> {
    const existing = await this.courseRepository.findOne({
      where: { shortName: createCourseDto.shortName },
    });
    if (existing) {
      throw new ConflictException(
        `Course with short name "${createCourseDto.shortName}" already exists`,
      );
    }

    const course = this.courseRepository.create({
      ...createCourseDto,
      creatorId,
    });

    const saved = await this.courseRepository.save(course);
    this.logger.log(`Course created: ${saved.shortName} (${saved.id})`);
    await this.invalidateCourseCache();
    return saved;
  }

  async findAll(paginationDto: PaginationDto & { categoryId?: string }): Promise<PaginatedResult<Course>> {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy,
      sortOrder,
    } = paginationDto;

    const safeSortBy = sanitizeSortBy('course', sortBy, 'createdAt');
    const safeSortOrder = sanitizeSortOrder(sortOrder);

    const qb = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect('course.creator', 'creator');

    if (search) {
      qb.andWhere(
        '(course.fullName ILIKE :search OR course.shortName ILIKE :search OR course.summary ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (paginationDto.categoryId) {
      qb.andWhere('course.categoryId = :categoryId', {
        categoryId: paginationDto.categoryId,
      });
    }

    qb.orderBy(`course.${safeSortBy}`, safeSortOrder)
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

  async findById(id: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['category', 'creator', 'enrollments', 'activities'],
    });
    if (!course) {
      throw new NotFoundException(`Course with ID "${id}" not found`);
    }
    return course;
  }

  async update(id: string, updateData: Partial<CreateCourseDto>): Promise<Course> {
    const course = await this.findById(id);

    if (updateData.shortName && updateData.shortName !== course.shortName) {
      const existing = await this.courseRepository.findOne({
        where: { shortName: updateData.shortName },
      });
      if (existing) {
        throw new ConflictException(
          `Course with short name "${updateData.shortName}" already exists`,
        );
      }
    }

    Object.assign(course, updateData);
    const updated = await this.courseRepository.save(course);
    await this.invalidateCourseCache();
    return updated;
  }

  async remove(id: string): Promise<void> {
    const course = await this.findById(id);
    await this.courseRepository.softRemove(course);
    await this.invalidateCourseCache();
    this.logger.log(`Course soft-deleted: ${course.shortName} (${id})`);
  }

  async findByCategory(categoryId: string, paginationDto: PaginationDto): Promise<PaginatedResult<Course>> {
    return this.findAll({ ...paginationDto, categoryId });
  }

  async getStats(): Promise<{
    total: number;
    visible: number;
    hidden: number;
    featured: number;
    byCategoryCount: { categoryId: string; categoryName: string; count: number }[];
  }> {
    // Check cache first (stats are expensive)
    const cacheKey = 'courses:stats';
    const cached = await this.cacheManager.get<any>(cacheKey);
    if (cached) return cached;

    const total = await this.courseRepository.count();
    const visible = await this.courseRepository.count({
      where: { visibility: 'visible' as any },
    });
    const hidden = await this.courseRepository.count({
      where: { visibility: 'hidden' as any },
    });
    const featured = await this.courseRepository.count({
      where: { isFeatured: true },
    });

    const byCategoryCount = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoin('course.category', 'category')
      .select('course.category_id', 'categoryId')
      .addSelect('category.name', 'categoryName')
      .addSelect('COUNT(course.id)', 'count')
      .groupBy('course.category_id')
      .addGroupBy('category.name')
      .getRawMany();

    const result = { total, visible, hidden, featured, byCategoryCount };
    await this.cacheManager.set(cacheKey, result, 300_000); // 5 min cache
    return result;
  }

  async getActivities(courseId: string) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['activities'],
    });
    if (!course) {
      throw new NotFoundException(`Course with ID "${courseId}" not found`);
    }
    return course.activities;
  }

  async getStudents(courseId: string) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['enrollments', 'enrollments.user'],
    });
    if (!course) {
      throw new NotFoundException(`Course with ID "${courseId}" not found`);
    }
    return course.enrollments.map((e) => ({
      ...e,
      user: e.user,
    }));
  }
}
