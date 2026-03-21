import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { RoleType } from './enums/role-type.enum';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      order: { sortOrder: 'ASC' },
    });
  }

  async findByName(name: RoleType): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { name },
    });
    if (!role) {
      throw new NotFoundException(`Role "${name}" not found`);
    }
    return role;
  }

  async findById(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
    });
    if (!role) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }
    return role;
  }

  async seedDefaultRoles(): Promise<void> {
    const defaults = [
      { name: RoleType.ADMIN, displayName: 'Administrator', description: 'Full access to all system features', sortOrder: 1 },
      { name: RoleType.MANAGER, displayName: 'Manager', description: 'Manage courses and users', sortOrder: 2 },
      { name: RoleType.COURSE_CREATOR, displayName: 'Course Creator', description: 'Can create new courses', sortOrder: 3 },
      { name: RoleType.TEACHER, displayName: 'Teacher', description: 'Can teach and manage course content', sortOrder: 4 },
      { name: RoleType.TEACHING_ASSISTANT, displayName: 'Teaching Assistant', description: 'Assist teachers in courses', sortOrder: 5 },
      { name: RoleType.STUDENT, displayName: 'Student', description: 'Can enroll and participate in courses', sortOrder: 6 },
      { name: RoleType.GUEST, displayName: 'Guest', description: 'Limited view-only access', sortOrder: 7 },
    ];

    for (const def of defaults) {
      const exists = await this.roleRepository.findOne({ where: { name: def.name } });
      if (!exists) {
        await this.roleRepository.save(this.roleRepository.create(def));
      }
    }
  }
}
