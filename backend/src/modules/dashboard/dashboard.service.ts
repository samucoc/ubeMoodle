import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Enrollment, EnrollmentStatus } from '../enrollments/entities/enrollment.entity';
import { Course } from '../courses/entities/course.entity';
import { Grade, GradeStatus } from '../grades/entities/grade.entity';
import { CalendarEvent } from '../calendar/entities/calendar-event.entity';
import { Activity } from '../activities/entities/activity.entity';
import { Message, MessageStatus } from '../messages/entities/message.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(Grade)
    private readonly gradeRepo: Repository<Grade>,
    @InjectRepository(CalendarEvent)
    private readonly calendarRepo: Repository<CalendarEvent>,
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  async getStats(userId: string) {
    // Enrolled courses count
    const enrolledCourses = await this.enrollmentRepo.count({
      where: { userId, status: EnrollmentStatus.ACTIVE },
    });

    // Average grade
    const gradeResult = await this.gradeRepo
      .createQueryBuilder('g')
      .select('AVG(g.percentage)', 'avg')
      .where('g.userId = :userId', { userId })
      .andWhere('g.status = :status', { status: GradeStatus.RELEASED })
      .getRawOne();

    const averageGrade = gradeResult?.avg
      ? parseFloat(parseFloat(gradeResult.avg).toFixed(1))
      : 0;

    // Pending activities (activities due in the future for enrolled courses)
    const activeEnrollments = await this.enrollmentRepo.find({
      where: { userId, status: EnrollmentStatus.ACTIVE },
      select: ['courseId'],
    });
    const courseIds = activeEnrollments.map((e) => e.courseId);

    let pendingActivities = 0;
    if (courseIds.length > 0) {
      pendingActivities = await this.activityRepo
        .createQueryBuilder('a')
        .where('a.courseId IN (:...courseIds)', { courseIds })
        .andWhere('a.dueDate >= :now', { now: new Date() })
        .andWhere('a.isVisible = true')
        .getCount();
    }

    // Unread messages
    const unreadMessages = await this.messageRepo.count({
      where: {
        recipientId: userId,
        status: MessageStatus.SENT,
        recipientDeleted: false,
      },
    });

    return {
      enrolledCourses,
      averageGrade,
      pendingActivities,
      unreadMessages,
    };
  }

  async getRecentCourses(userId: string, limit = 6) {
    const enrollments = await this.enrollmentRepo.find({
      where: { userId, status: EnrollmentStatus.ACTIVE },
      relations: ['course', 'course.category', 'course.creator'],
      order: { lastAccessed: { direction: 'DESC', nulls: 'LAST' } },
      take: limit,
    });

    return enrollments.map((e) => ({
      ...e.course,
      progress: e.progress,
      lastAccessed: e.lastAccessed,
      enrolledAt: e.enrolledAt,
    }));
  }

  async getUpcomingEvents(userId: string, limit = 10) {
    const now = new Date();

    // User personal events + events from enrolled courses
    const activeEnrollments = await this.enrollmentRepo.find({
      where: { userId, status: EnrollmentStatus.ACTIVE },
      select: ['courseId'],
    });
    const courseIds = activeEnrollments.map((e) => e.courseId);

    const qb = this.calendarRepo
      .createQueryBuilder('ce')
      .where('ce.startTime >= :now', { now })
      .andWhere('ce.isVisible = true');

    if (courseIds.length > 0) {
      qb.andWhere('(ce.userId = :userId OR ce.courseId IN (:...courseIds) OR ce.userId IS NULL)', {
        userId,
        courseIds,
      });
    } else {
      qb.andWhere('(ce.userId = :userId OR ce.userId IS NULL)', { userId });
    }

    return qb
      .orderBy('ce.startTime', 'ASC')
      .take(limit)
      .getMany();
  }

  /** Admin dashboard stats */
  async getAdminStats() {
    const [totalUsers, totalCourses, totalEnrollments, totalCategories] =
      await Promise.all([
        this.enrollmentRepo.manager.getRepository('users').count(),
        this.enrollmentRepo.manager.getRepository('courses').count(),
        this.enrollmentRepo.count({ where: { status: EnrollmentStatus.ACTIVE } }),
        this.enrollmentRepo.manager.getRepository('categories').count(),
      ]);

    return { totalUsers, totalCourses, totalEnrollments, totalCategories };
  }
}
