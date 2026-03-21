import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from './courses.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { NotFoundException } from '@nestjs/common';

const mockCourseRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  softRemove: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
  })),
  count: jest.fn(),
};

describe('CoursesService', () => {
  let service: CoursesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: getRepositoryToken(Course), useValue: mockCourseRepository },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return a course when found', async () => {
      const course = {
        id: 'uuid-1',
        fullName: 'Test Course',
        shortName: 'TC101',
      };
      mockCourseRepository.findOne.mockResolvedValue(course);

      const result = await service.findById('uuid-1');
      expect(result).toEqual(course);
    });

    it('should throw NotFoundException when not found', async () => {
      mockCourseRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create and return a new course', async () => {
      const dto = {
        fullName: 'New Course',
        shortName: 'NC101',
        summary: 'A new course',
      };
      const created = { id: 'uuid-new', ...dto };
      mockCourseRepository.create.mockReturnValue(created);
      mockCourseRepository.save.mockResolvedValue(created);

      const result = await service.create(dto as any, 'creator-id');
      expect(mockCourseRepository.create).toHaveBeenCalled();
      expect(result).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.meta.total).toBe(0);
    });
  });

  describe('remove', () => {
    it('should soft-delete a course', async () => {
      const course = { id: 'uuid-1', fullName: 'Test' };
      mockCourseRepository.findOne.mockResolvedValue(course);
      mockCourseRepository.softRemove.mockResolvedValue(course);

      await service.remove('uuid-1');
      expect(mockCourseRepository.softRemove).toHaveBeenCalledWith(course);
    });

    it('should throw NotFoundException for non-existent course', async () => {
      mockCourseRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
