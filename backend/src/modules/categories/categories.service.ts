import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { Category } from './entities/category.entity';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { sanitizeSortBy, sanitizeSortOrder } from '../../common/utils/query-sanitizer';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: TreeRepository<Category>,
  ) {}

  async create(data: {
    name: string;
    description?: string;
    idNumber?: string;
    parentId?: string;
    isVisible?: boolean;
    sortOrder?: number;
    iconUrl?: string;
    color?: string;
  }): Promise<Category> {
    const { parentId, ...rest } = data;

    let parent: Category | null = null;
    if (parentId) {
      parent = await this.categoryRepository.findOne({ where: { id: parentId } });
      if (!parent) {
        throw new NotFoundException(`Parent category with ID "${parentId}" not found`);
      }
    }

    if (data.idNumber) {
      const existing = await this.categoryRepository.findOne({
        where: { idNumber: data.idNumber },
      });
      if (existing) {
        throw new ConflictException(`Category with idNumber "${data.idNumber}" already exists`);
      }
    }

    const category = this.categoryRepository.create({
      ...rest,
      parent,
    });

    const saved = await this.categoryRepository.save(category);
    this.logger.log(`Category created: ${saved.name} (${saved.id})`);
    return saved;
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<Category>> {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy,
      sortOrder,
    } = paginationDto;

    const safeSortBy = sanitizeSortBy('category', sortBy, 'sortOrder');
    const safeSortOrder = sanitizeSortOrder(sortOrder) === 'DESC' ? 'DESC' : 'ASC';

    const qb = this.categoryRepository.createQueryBuilder('category');

    if (search) {
      qb.andWhere(
        '(category.name ILIKE :search OR category.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy(`category.${safeSortBy}`, safeSortOrder)
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

  async findById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['courses'],
    });
    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }
    return category;
  }

  async update(id: string, data: Partial<{
    name: string;
    description: string;
    idNumber: string;
    parentId: string;
    isVisible: boolean;
    sortOrder: number;
    iconUrl: string;
    color: string;
  }>): Promise<Category> {
    const category = await this.findById(id);

    if (data.parentId) {
      const parent = await this.categoryRepository.findOne({
        where: { id: data.parentId },
      });
      if (!parent) {
        throw new NotFoundException(`Parent category with ID "${data.parentId}" not found`);
      }
      category.parent = parent;
    }

    const { parentId, ...rest } = data;
    Object.assign(category, rest);
    return this.categoryRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findById(id);
    await this.categoryRepository.softRemove(category);
    this.logger.log(`Category soft-deleted: ${category.name} (${id})`);
  }

  async getTree(): Promise<Category[]> {
    return this.categoryRepository.findTrees();
  }

  async getChildren(id: string): Promise<Category[]> {
    const parent = await this.findById(id);
    return this.categoryRepository.findDescendants(parent);
  }

  async getRoots(): Promise<Category[]> {
    return this.categoryRepository.findRoots();
  }
}
