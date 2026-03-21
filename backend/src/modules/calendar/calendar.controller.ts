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
import { CalendarService } from './calendar.service';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RoleType } from '../roles/enums/role-type.enum';
import { User } from '../users/entities/user.entity';

@ApiTags('Calendar')
@ApiBearerAuth('access-token')
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new calendar event' })
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  create(
    @Body() createCalendarEventDto: CreateCalendarEventDto,
    @CurrentUser() user: User,
  ) {
    return this.calendarService.create({ ...createCalendarEventDto, userId: user.id });
  }

  @Get()
  @ApiOperation({ summary: 'Get all calendar events with pagination' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.calendarService.findAll(paginationDto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user calendar events' })
  getMyEvents(@CurrentUser() user: User) {
    return this.calendarService.findByUser(user.id);
  }

  @Get('my/upcoming')
  @ApiOperation({ summary: 'Get upcoming events for current user' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getUpcoming(
    @CurrentUser() user: User,
    @Query('limit') limit?: number,
  ) {
    return this.calendarService.getUpcoming(user.id, limit);
  }

  @Get('range')
  @ApiOperation({ summary: 'Get events within a date range' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'courseId', required: false })
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('userId') userId?: string,
    @Query('courseId') courseId?: string,
  ) {
    return this.calendarService.findByDateRange(
      new Date(startDate),
      new Date(endDate),
      userId,
      courseId,
    );
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get events for a specific course' })
  findByCourse(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.calendarService.findByCourse(courseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get calendar event by ID' })
  @ApiResponse({ status: 200, description: 'Event found' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.calendarService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a calendar event' })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCalendarEventDto: UpdateCalendarEventDto,
  ) {
    return this.calendarService.update(id, updateCalendarEventDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a calendar event (soft delete)' })
  @ApiResponse({ status: 204, description: 'Event deleted successfully' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.calendarService.remove(id);
  }
}
