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
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RoleType } from '../roles/enums/role-type.enum';

@ApiTags('Activities')
@ApiBearerAuth('access-token')
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MANAGER, RoleType.TEACHER)
  @ApiOperation({ summary: 'Create a new activity' })
  @ApiResponse({ status: 201, description: 'Activity created successfully' })
  create(@Body() createActivityDto: CreateActivityDto) {
    return this.activitiesService.create(createActivityDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all activities with pagination and filtering' })
  @ApiQuery({ name: 'courseId', required: false })
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query('courseId') courseId?: string,
  ) {
    return this.activitiesService.findAll({ ...paginationDto, courseId });
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get all activities for a course ordered by section' })
  findByCourse(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.activitiesService.findByCourse(courseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get activity by ID' })
  @ApiResponse({ status: 200, description: 'Activity found' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.activitiesService.findById(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MANAGER, RoleType.TEACHER)
  @ApiOperation({ summary: 'Update an activity' })
  @ApiResponse({ status: 200, description: 'Activity updated successfully' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateActivityDto: UpdateActivityDto,
  ) {
    return this.activitiesService.update(id, updateActivityDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MANAGER, RoleType.TEACHER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an activity (soft delete)' })
  @ApiResponse({ status: 204, description: 'Activity deleted successfully' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.activitiesService.remove(id);
  }

  @Put('course/:courseId/reorder')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MANAGER, RoleType.TEACHER)
  @ApiOperation({ summary: 'Reorder activities within a course' })
  reorder(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body() items: { id: string; section: number; sortOrder: number }[],
  ) {
    return this.activitiesService.reorder(courseId, items);
  }
}
