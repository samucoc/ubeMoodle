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
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RoleType } from '../roles/enums/role-type.enum';
import { User } from '../users/entities/user.entity';

@ApiTags('Enrollments')
@ApiBearerAuth('access-token')
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MANAGER, RoleType.TEACHER)
  @ApiOperation({ summary: 'Enroll a user in a course' })
  @ApiResponse({ status: 201, description: 'User enrolled successfully' })
  enroll(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentsService.enroll(createEnrollmentDto);
  }

  @Post('self-enroll')
  @ApiOperation({ summary: 'Self-enroll current user in a course' })
  @ApiResponse({ status: 201, description: 'Self-enrollment successful' })
  selfEnroll(
    @Body() body: { courseId: string; enrollmentKey?: string },
    @CurrentUser() user: User,
  ) {
    return this.enrollmentsService.enroll({
      userId: user.id,
      courseId: body.courseId,
    });
  }

  @Delete(':userId/:courseId')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MANAGER, RoleType.TEACHER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unenroll a user from a course' })
  @ApiResponse({ status: 204, description: 'User unenrolled successfully' })
  unenroll(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ) {
    return this.enrollmentsService.unenroll(userId, courseId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all enrollments for a user' })
  getUserEnrollments(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.enrollmentsService.getUserEnrollments(userId, paginationDto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user enrollments' })
  getMyEnrollments(
    @CurrentUser() user: User,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.enrollmentsService.getUserEnrollments(user.id, paginationDto);
  }

  @Get('course/:courseId')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MANAGER, RoleType.TEACHER)
  @ApiOperation({ summary: 'Get all enrollments for a course' })
  getCourseEnrollments(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.enrollmentsService.getCourseEnrollments(courseId, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get enrollment by ID' })
  @ApiResponse({ status: 200, description: 'Enrollment found' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.enrollmentsService.findById(id);
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MANAGER, RoleType.TEACHER)
  @ApiOperation({ summary: 'Update enrollment status' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: EnrollmentStatus,
  ) {
    return this.enrollmentsService.updateStatus(id, status);
  }

  @Put(':id/progress')
  @ApiOperation({ summary: 'Update enrollment progress' })
  updateProgress(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('progress') progress: number,
  ) {
    return this.enrollmentsService.updateProgress(id, progress);
  }
}
