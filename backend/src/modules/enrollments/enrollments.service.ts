import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment, EnrollmentStatus, EnrollmentRole } from './entities/enrollment.entity';
import { Course } from '../courses/entities/course.entity';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { sanitizeSortBy, sanitizeSortOrder } from '../../common/utils/query-sanitizer';

@Injectable()
export class EnrollmentsService {
  private readonly logger = new Logger(EnrollmentsService.name);

  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async enroll(data: {
    userId: string;
    courseId: string;
    role?: EnrollmentRole;
    expiresAt?: Date;
  }): Promise<Enrollment> {
    const { userId, courseId, role = EnrollmentRole.STUDENT, expiresAt } = data;

    // Check duplicate enrollment
    const existing = await this.enrollmentRepository.findOne({
      where: { userId, courseId },
    });
    if (existing) {
      if (existing.status === EnrollmentStatus.ACTIVE) {
        throw new ConflictException('User is already enrolled in this course');
      }
      // Reactivate a previously suspended/expired enrollment
      existing.status = EnrollmentStatus.ACTIVE;
      existing.enrolledAt = new Date();
      return this.enrollmentRepository.save(existing);
    }

    // Check course capacity
    const course = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException(`Course with ID "${courseId}" not found`);
    }

    if (course.maxStudents > 0) {
      const currentCount = await this.enrollmentRepository.count({
        where: { courseId, status: EnrollmentStatus.ACTIVE },
      });
      if (currentCount >= course.maxStudents) {
        throw new BadRequestException('Course has reached maximum enrollment capacity');
      }
    }

    const enrollment = this.enrollmentRepository.create({
      userId,
      courseId,
      role,
      expiresAt,
    });

    const saved = await this.enrollmentRepository.save(enrollment);
    this.logger.log(`User ${userId} enrolled in course ${courseId} as ${role}`);
    return saved;
  }

  async unenroll(userId: string, courseId: string): Promise<void> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { userId, courseId },
    });
    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }
    await this.enrollmentRepository.softRemove(enrollment);
    this.logger.log(`User ${userId} unenrolled from course ${courseId}`);
  }

  async getUserEnrollments(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Enrollment>> {
    const { page = 1, limit = 20, sortBy, sortOrder } = paginationDto;

    const safeSortBy = sanitizeSortBy('enrollment', sortBy, 'enrolledAt');
    const safeSortOrder = sanitizeSortOrder(sortOrder);

    const qb = this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.course', 'course')
      .leftJoinAndSelect('course.category', 'category')
      .where('enrollment.userId = :userId', { userId });

    if (paginationDto.search) {
      qb.andWhere(
        '(course.fullName ILIKE :search OR course.shortName ILIKE :search)',
        { search: `%${paginationDto.search}%` },
      );
    }

    qb.orderBy(`enrollment.${safeSortBy}`, safeSortOrder)
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

  async getCourseEnrollments(
    courseId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Enrollment>> {
    const { page = 1, limit = 20, sortBy, sortOrder } = paginationDto;

    const safeSortBy = sanitizeSortBy('enrollment', sortBy, 'enrolledAt');
    const safeSortOrder = sanitizeSortOrder(sortOrder);

    const qb = this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.user', 'user')
      .where('enrollment.courseId = :courseId', { courseId });

    if (paginationDto.search) {
      qb.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${paginationDto.search}%` },
      );
    }

    qb.orderBy(`enrollment.${safeSortBy}`, safeSortOrder)
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

  async findById(id: string): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id },
      relations: ['user', 'course'],
    });
    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID "${id}" not found`);
    }
    return enrollment;
  }

  async updateStatus(id: string, status: EnrollmentStatus): Promise<Enrollment> {
    const enrollment = await this.findById(id);
    enrollment.status = status;
    if (status === EnrollmentStatus.COMPLETED) {
      enrollment.completedAt = new Date();
    }
    return this.enrollmentRepository.save(enrollment);
  }

  async updateProgress(id: string, progress: number): Promise<Enrollment> {
    const enrollment = await this.findById(id);
    enrollment.progress = progress;
    enrollment.lastAccessed = new Date();
    return this.enrollmentRepository.save(enrollment);
  }
}
