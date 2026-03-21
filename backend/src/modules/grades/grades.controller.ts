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
} from '@nestjs/swagger';
import { GradesService } from './grades.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto, GradeSubmissionDto } from './dto/update-grade.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RoleType } from '../roles/enums/role-type.enum';
import { User } from '../users/entities/user.entity';

@ApiTags('Grades')
@ApiBearerAuth('access-token')
@Controller('grades')
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.TEACHER, RoleType.TEACHING_ASSISTANT)
  @ApiOperation({ summary: 'Create a grade entry' })
  @ApiResponse({ status: 201, description: 'Grade created successfully' })
  create(@Body() createGradeDto: CreateGradeDto) {
    return this.gradesService.create(createGradeDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MANAGER)
  @ApiOperation({ summary: 'Get all grades with pagination' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.gradesService.findAll(paginationDto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user grades' })
  getMyGrades(@CurrentUser() user: User) {
    return this.gradesService.getByUser(user.id);
  }

  @Get('my/course/:courseId')
  @ApiOperation({ summary: 'Get current user grades for a specific course' })
  getMyGradesByCourse(
    @CurrentUser() user: User,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ) {
    return this.gradesService.getByUserAndCourse(user.id, courseId);
  }

  @Get('my/course/:courseId/average')
  @ApiOperation({ summary: 'Get current user average for a specific course' })
  getMyAverage(
    @CurrentUser() user: User,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ) {
    return this.gradesService.getUserCourseAverage(user.id, courseId);
  }

  @Get('user/:userId')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.TEACHER)
  @ApiOperation({ summary: 'Get grades for a specific user' })
  getByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.gradesService.getByUser(userId);
  }

  @Get('course/:courseId')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.TEACHER, RoleType.TEACHING_ASSISTANT)
  @ApiOperation({ summary: 'Get all grades for a course' })
  getByCourse(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.gradesService.getByCourse(courseId);
  }

  @Get('course/:courseId/average')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.TEACHER)
  @ApiOperation({ summary: 'Get average grade for a course' })
  getCourseAverage(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.gradesService.getCourseAverage(courseId);
  }

  @Get('activity/:activityId')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.TEACHER, RoleType.TEACHING_ASSISTANT)
  @ApiOperation({ summary: 'Get all grades for an activity' })
  getByActivity(@Param('activityId', ParseUUIDPipe) activityId: string) {
    return this.gradesService.getByActivity(activityId);
  }

  @Get('activity/:activityId/average')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.TEACHER)
  @ApiOperation({ summary: 'Get average grade for an activity' })
  getActivityAverage(@Param('activityId', ParseUUIDPipe) activityId: string) {
    return this.gradesService.getActivityAverage(activityId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get grade by ID' })
  @ApiResponse({ status: 200, description: 'Grade found' })
  @ApiResponse({ status: 404, description: 'Grade not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.gradesService.findById(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.TEACHER, RoleType.TEACHING_ASSISTANT)
  @ApiOperation({ summary: 'Update a grade' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateGradeDto: UpdateGradeDto,
  ) {
    return this.gradesService.update(id, updateGradeDto);
  }

  @Put(':id/grade')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.TEACHER, RoleType.TEACHING_ASSISTANT)
  @ApiOperation({ summary: 'Grade a submission' })
  gradeSubmission(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() gradeSubmissionDto: GradeSubmissionDto,
    @CurrentUser() user: User,
  ) {
    return this.gradesService.gradeSubmission(
      id,
      gradeSubmissionDto.grade,
      gradeSubmissionDto.feedback ?? null,
      user.id,
    );
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.TEACHER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a grade (soft delete)' })
  @ApiResponse({ status: 204, description: 'Grade deleted successfully' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.gradesService.remove(id);
  }
}
