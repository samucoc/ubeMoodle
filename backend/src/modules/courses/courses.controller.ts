import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RoleType } from '../roles/enums/role-type.enum';
import { User } from '../users/entities/user.entity';

@ApiTags('Courses')
@ApiBearerAuth('access-token')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MANAGER, RoleType.COURSE_CREATOR)
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  create(@Body() createCourseDto: CreateCourseDto, @CurrentUser() user: User) {
    return this.coursesService.create(createCourseDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all courses with pagination and filtering' })
  @ApiQuery({ name: 'categoryId', required: false })
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.coursesService.findAll({ ...paginationDto, categoryId });
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MANAGER)
  @ApiOperation({ summary: 'Get course statistics' })
  getStats() {
    return this.coursesService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiResponse({ status: 200, description: 'Course found' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.findById(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MANAGER, RoleType.TEACHER)
  @ApiOperation({ summary: 'Update a course' })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a course (soft delete)' })
  @ApiResponse({ status: 204, description: 'Course deleted successfully' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.remove(id);
  }

  @Get(':id/activities')
  @ApiOperation({ summary: 'Get all activities for a course' })
  getActivities(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.getActivities(id);
  }

  @Get(':id/students')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MANAGER, RoleType.TEACHER)
  @ApiOperation({ summary: 'Get all students enrolled in a course' })
  getStudents(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.getStudents(id);
  }
}
