import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade, GradeStatus } from './entities/grade.entity';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { sanitizeSortBy, sanitizeSortOrder } from '../../common/utils/query-sanitizer';

@Injectable()
export class GradesService {
  private readonly logger = new Logger(GradesService.name);

  constructor(
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
  ) {}

  async create(data: Partial<Grade>): Promise<Grade> {
    if (data.grade != null && data.maxGrade) {
      data.percentage = parseFloat(((data.grade / data.maxGrade) * 100).toFixed(2));
      data.letterGrade = this.calculateLetterGrade(data.percentage);
    }

    const grade = this.gradeRepository.create(data);
    const saved = await this.gradeRepository.save(grade);
    this.logger.log(`Grade created for user ${saved.userId} on activity ${saved.activityId}`);
    return saved;
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<Grade>> {
    const {
      page = 1,
      limit = 20,
      sortBy,
      sortOrder,
    } = paginationDto;

    const safeSortBy = sanitizeSortBy('grade', sortBy, 'createdAt');
    const safeSortOrder = sanitizeSortOrder(sortOrder);

    const qb = this.gradeRepository
      .createQueryBuilder('grade')
      .leftJoinAndSelect('grade.user', 'user')
      .leftJoinAndSelect('grade.activity', 'activity')
      .leftJoinAndSelect('grade.course', 'course');

    qb.orderBy(`grade.${safeSortBy}`, safeSortOrder)
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

  async findById(id: string): Promise<Grade> {
    const grade = await this.gradeRepository.findOne({
      where: { id },
      relations: ['user', 'activity', 'course'],
    });
    if (!grade) {
      throw new NotFoundException(`Grade with ID "${id}" not found`);
    }
    return grade;
  }

  async getByUser(userId: string): Promise<Grade[]> {
    return this.gradeRepository.find({
      where: { userId },
      relations: ['activity', 'course'],
      order: { createdAt: 'DESC' },
    });
  }

  async getByCourse(courseId: string): Promise<Grade[]> {
    return this.gradeRepository.find({
      where: { courseId },
      relations: ['user', 'activity'],
      order: { createdAt: 'DESC' },
    });
  }

  async getByActivity(activityId: string): Promise<Grade[]> {
    return this.gradeRepository.find({
      where: { activityId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getByUserAndCourse(userId: string, courseId: string): Promise<Grade[]> {
    return this.gradeRepository.find({
      where: { userId, courseId },
      relations: ['activity'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, data: Partial<Grade>): Promise<Grade> {
    const grade = await this.findById(id);

    if (data.grade != null) {
      const maxGrade = data.maxGrade ?? grade.maxGrade;
      data.percentage = parseFloat(((data.grade / maxGrade) * 100).toFixed(2));
      data.letterGrade = this.calculateLetterGrade(data.percentage);
    }

    Object.assign(grade, data);
    return this.gradeRepository.save(grade);
  }

  async gradeSubmission(
    id: string,
    gradeValue: number,
    feedback: string | null,
    gradedBy: string,
  ): Promise<Grade> {
    const grade = await this.findById(id);
    grade.grade = gradeValue;
    grade.percentage = parseFloat(((gradeValue / grade.maxGrade) * 100).toFixed(2));
    grade.letterGrade = this.calculateLetterGrade(grade.percentage);
    grade.feedback = feedback;
    grade.gradedBy = gradedBy;
    grade.gradedAt = new Date();
    grade.status = GradeStatus.GRADED;
    return this.gradeRepository.save(grade);
  }

  async remove(id: string): Promise<void> {
    const grade = await this.findById(id);
    await this.gradeRepository.softRemove(grade);
    this.logger.log(`Grade soft-deleted: ${id}`);
  }

  async getCourseAverage(courseId: string): Promise<{ average: number; count: number }> {
    const result = await this.gradeRepository
      .createQueryBuilder('grade')
      .select('AVG(grade.percentage)', 'average')
      .addSelect('COUNT(grade.id)', 'count')
      .where('grade.courseId = :courseId', { courseId })
      .andWhere('grade.status != :status', { status: GradeStatus.PENDING })
      .andWhere('grade.percentage IS NOT NULL')
      .getRawOne();

    return {
      average: parseFloat(result?.average || '0'),
      count: parseInt(result?.count || '0', 10),
    };
  }

  async getActivityAverage(activityId: string): Promise<{ average: number; count: number }> {
    const result = await this.gradeRepository
      .createQueryBuilder('grade')
      .select('AVG(grade.percentage)', 'average')
      .addSelect('COUNT(grade.id)', 'count')
      .where('grade.activityId = :activityId', { activityId })
      .andWhere('grade.status != :status', { status: GradeStatus.PENDING })
      .andWhere('grade.percentage IS NOT NULL')
      .getRawOne();

    return {
      average: parseFloat(result?.average || '0'),
      count: parseInt(result?.count || '0', 10),
    };
  }

  async getUserCourseAverage(
    userId: string,
    courseId: string,
  ): Promise<{ average: number; count: number }> {
    const result = await this.gradeRepository
      .createQueryBuilder('grade')
      .select('AVG(grade.percentage)', 'average')
      .addSelect('COUNT(grade.id)', 'count')
      .where('grade.userId = :userId', { userId })
      .andWhere('grade.courseId = :courseId', { courseId })
      .andWhere('grade.status != :status', { status: GradeStatus.PENDING })
      .andWhere('grade.percentage IS NOT NULL')
      .getRawOne();

    return {
      average: parseFloat(result?.average || '0'),
      count: parseInt(result?.count || '0', 10),
    };
  }

  private calculateLetterGrade(percentage: number): string {
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 63) return 'D';
    if (percentage >= 60) return 'D-';
    return 'F';
  }
}
