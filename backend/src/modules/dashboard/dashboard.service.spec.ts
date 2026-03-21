import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { Grade } from '../grades/entities/grade.entity';
import { CalendarEvent } from '../calendar/entities/calendar-event.entity';
import { Activity } from '../activities/entities/activity.entity';
import { Message } from '../messages/entities/message.entity';

const mockEnrollmentRepo = {
  count: jest.fn().mockResolvedValue(5),
  find: jest.fn().mockResolvedValue([]),
  createQueryBuilder: jest.fn(() => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
    getCount: jest.fn().mockResolvedValue(5),
  })),
};

const mockGradeRepo = {
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    getRawOne: jest.fn().mockResolvedValue({ avg: '85.5' }),
  })),
};

const mockCalendarEventRepo = {
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  })),
};

const mockActivityRepo = {
  count: jest.fn().mockResolvedValue(3),
};

const mockMessageRepo = {
  count: jest.fn().mockResolvedValue(2),
};

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getRepositoryToken(Enrollment), useValue: mockEnrollmentRepo },
        { provide: getRepositoryToken(Grade), useValue: mockGradeRepo },
        { provide: getRepositoryToken(CalendarEvent), useValue: mockCalendarEventRepo },
        { provide: getRepositoryToken(Activity), useValue: mockActivityRepo },
        { provide: getRepositoryToken(Message), useValue: mockMessageRepo },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStats', () => {
    it('should return dashboard stats for a user', async () => {
      const result = await service.getStats('user-uuid');

      expect(result).toHaveProperty('enrolledCourses');
      expect(result).toHaveProperty('averageGrade');
      expect(result).toHaveProperty('pendingActivities');
      expect(result).toHaveProperty('unreadMessages');
    });
  });

  describe('getRecentCourses', () => {
    it('should return recent courses list', async () => {
      const result = await service.getRecentCourses('user-uuid', 5);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getUpcomingEvents', () => {
    it('should return upcoming events list', async () => {
      const result = await service.getUpcomingEvents('user-uuid', 5);
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
