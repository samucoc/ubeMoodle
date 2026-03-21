import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
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
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CurrentUser } from '../../common/decorators';
import { User } from '../users/entities/user.entity';

@ApiTags('Messages')
@ApiBearerAuth('access-token')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Send a new message' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  send(
    @Body() createMessageDto: CreateMessageDto,
    @CurrentUser() user: User,
  ) {
    return this.messagesService.send({
      senderId: user.id,
      ...createMessageDto,
    });
  }

  @Get('inbox')
  @ApiOperation({ summary: 'Get inbox messages for current user' })
  getInbox(
    @CurrentUser() user: User,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.messagesService.getInbox(user.id, paginationDto);
  }

  @Get('sent')
  @ApiOperation({ summary: 'Get sent messages for current user' })
  getSent(
    @CurrentUser() user: User,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.messagesService.getSent(user.id, paginationDto);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get list of conversations for current user' })
  getConversations(@CurrentUser() user: User) {
    return this.messagesService.getConversations(user.id);
  }

  @Get('conversation/:otherUserId')
  @ApiOperation({ summary: 'Get conversation with a specific user' })
  getConversation(
    @CurrentUser() user: User,
    @Param('otherUserId', ParseUUIDPipe) otherUserId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.messagesService.getConversation(user.id, otherUserId, paginationDto);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread message count for current user' })
  getUnreadCount(@CurrentUser() user: User) {
    return this.messagesService.getUnreadCount(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get message by ID' })
  @ApiResponse({ status: 200, description: 'Message found' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.messagesService.findById(id, user.id);
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark a message as read' })
  markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.messagesService.markAsRead(id, user.id);
  }

  @Put('read-all')
  @ApiOperation({ summary: 'Mark all messages as read' })
  markAllAsRead(@CurrentUser() user: User) {
    return this.messagesService.markAllAsRead(user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a message for current user' })
  @ApiResponse({ status: 204, description: 'Message deleted successfully' })
  delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.messagesService.deleteForUser(id, user.id);
  }
}
