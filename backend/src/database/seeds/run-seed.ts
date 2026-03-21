import { DataSource } from 'typeorm';
import dataSource from '../../config/data-source';
import { RoleType } from '../../modules/roles/enums/role-type.enum';
import * as bcrypt from 'bcrypt';

const DEFAULT_ROLES = [
  { name: RoleType.ADMIN, displayName: 'Administrator', description: 'Full access to all system features', sortOrder: 1 },
  { name: RoleType.MANAGER, displayName: 'Manager', description: 'Manage courses and users', sortOrder: 2 },
  { name: RoleType.COURSE_CREATOR, displayName: 'Course Creator', description: 'Can create new courses', sortOrder: 3 },
  { name: RoleType.TEACHER, displayName: 'Teacher', description: 'Can teach and manage course content', sortOrder: 4 },
  { name: RoleType.TEACHING_ASSISTANT, displayName: 'Teaching Assistant', description: 'Assist teachers in courses', sortOrder: 5 },
  { name: RoleType.STUDENT, displayName: 'Student', description: 'Can enroll and participate in courses', sortOrder: 6 },
  { name: RoleType.GUEST, displayName: 'Guest', description: 'Limited view-only access', sortOrder: 7 },
];

async function seed(ds: DataSource) {
  console.log('🌱 Starting database seed...');

  // Seed roles
  const roleRepo = ds.getRepository('roles');
  for (const def of DEFAULT_ROLES) {
    const exists = await roleRepo.findOne({ where: { name: def.name } });
    if (!exists) {
      await roleRepo.save(roleRepo.create(def));
      console.log(`  ✅ Role created: ${def.displayName}`);
    } else {
      console.log(`  ⏭️  Role already exists: ${def.displayName}`);
    }
  }

  // Seed admin user
  const userRepo = ds.getRepository('users');
  const adminExists = await userRepo.findOne({ where: { username: 'admin' } });

  if (!adminExists) {
    const adminRole = await roleRepo.findOne({ where: { name: RoleType.ADMIN } });
    const hashedPassword = await bcrypt.hash('Admin@1234', 12);

    const admin = userRepo.create({
      username: 'admin',
      email: 'admin@moodlenext.local',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      isActive: true,
      isEmailVerified: true,
    });

    const savedAdmin = await userRepo.save(admin);

    // Assign admin role via junction table
    await ds
      .createQueryBuilder()
      .insert()
      .into('user_roles')
      .values({ user_id: savedAdmin.id, role_id: adminRole.id })
      .execute();

    console.log('  ✅ Admin user created (admin / Admin@1234)');
  } else {
    console.log('  ⏭️  Admin user already exists');
  }

  // Seed default categories
  const catRepo = ds.getRepository('categories');
  const defaultCategories = [
    { name: 'Computer Science', description: 'Programming and computer science courses', idNumber: 'CS', sortOrder: 1 },
    { name: 'Mathematics', description: 'Mathematics and statistics courses', idNumber: 'MATH', sortOrder: 2 },
    { name: 'Languages', description: 'Language learning courses', idNumber: 'LANG', sortOrder: 3 },
    { name: 'Science', description: 'Natural and applied sciences', idNumber: 'SCI', sortOrder: 4 },
    { name: 'Humanities', description: 'History, philosophy, and arts', idNumber: 'HUM', sortOrder: 5 },
  ];

  for (const cat of defaultCategories) {
    const exists = await catRepo.findOne({ where: { idNumber: cat.idNumber } });
    if (!exists) {
      await catRepo.save(catRepo.create(cat));
      console.log(`  ✅ Category created: ${cat.name}`);
    }
  }

  console.log('🌱 Seed completed successfully!');
}

async function run() {
  try {
    await dataSource.initialize();
    await seed(dataSource);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

run();
