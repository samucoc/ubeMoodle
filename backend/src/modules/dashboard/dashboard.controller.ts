import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RoleType } from '../roles/enums/role-type.enum';

@ApiTags('Dashboard')
@ApiBearerAuth('access-token')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get current user dashboard statistics' })
  getStats(@CurrentUser('id') userId: string) {
    return this.dashboardService.getStats(userId);
  }

  @Get('recent-courses')
  @ApiOperation({ summary: 'Get recently accessed courses for current user' })
  getRecentCourses(@CurrentUser('id') userId: string) {
    return this.dashboardService.getRecentCourses(userId);
  }

  @Get('upcoming-events')
  @ApiOperation({ summary: 'Get upcoming events for current user' })
  getUpcomingEvents(@CurrentUser('id') userId: string) {
    return this.dashboardService.getUpcomingEvents(userId);
  }

  @Get('admin/stats')
  @UseGuards(RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MANAGER)
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  getAdminStats() {
    return this.dashboardService.getAdminStats();
  }
}
