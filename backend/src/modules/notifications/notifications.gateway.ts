import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';

interface NotificationPayload {
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  timestamp?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.APP_CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private readonly userSockets = new Map<string, Set<string>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit() {
    this.logger.log('Notifications WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      // Authenticate via JWT token from handshake
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Client ${client.id} rejected: no auth token`);
        client.disconnect(true);
        return;
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const userId = payload.sub;
      if (!userId) {
        client.disconnect(true);
        return;
      }

      // Store authenticated userId on the socket for later use
      (client as any).userId = userId;

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);
      client.join(`user:${userId}`);
      this.logger.log(`Client connected: ${client.id} (user: ${userId})`);
    } catch {
      this.logger.warn(`Client ${client.id} rejected: invalid token`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = (client as any).userId;
    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId)!.delete(client.id);
      if (this.userSockets.get(userId)!.size === 0) {
        this.userSockets.delete(userId);
      }
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-course')
  handleJoinCourse(
    @ConnectedSocket() client: Socket,
    @MessageBody() courseId: string,
  ) {
    client.join(`course:${courseId}`);
    this.logger.debug(`Client ${client.id} joined course room: ${courseId}`);
    return { event: 'joined-course', data: courseId };
  }

  @SubscribeMessage('leave-course')
  handleLeaveCourse(
    @ConnectedSocket() client: Socket,
    @MessageBody() courseId: string,
  ) {
    client.leave(`course:${courseId}`);
    this.logger.debug(`Client ${client.id} left course room: ${courseId}`);
    return { event: 'left-course', data: courseId };
  }

  /**
   * Send a notification to a specific user
   */
  sendToUser(userId: string, notification: NotificationPayload): void {
    const payload = {
      ...notification,
      timestamp: notification.timestamp ?? new Date().toISOString(),
    };
    this.server.to(`user:${userId}`).emit('notification', payload);
    this.logger.debug(`Notification sent to user ${userId}: ${notification.type}`);
  }

  /**
   * Send a notification to all users in a course
   */
  sendToCourse(courseId: string, notification: NotificationPayload): void {
    const payload = {
      ...notification,
      timestamp: notification.timestamp ?? new Date().toISOString(),
    };
    this.server.to(`course:${courseId}`).emit('notification', payload);
    this.logger.debug(`Notification sent to course ${courseId}: ${notification.type}`);
  }

  /**
   * Broadcast a notification to all connected clients
   */
  broadcast(notification: NotificationPayload): void {
    const payload = {
      ...notification,
      timestamp: notification.timestamp ?? new Date().toISOString(),
    };
    this.server.emit('notification', payload);
    this.logger.debug(`Broadcast notification: ${notification.type}`);
  }

  /**
   * Check if a user is currently online
   */
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }

  /**
   * Get count of online users
   */
  getOnlineUserCount(): number {
    return this.userSockets.size;
  }
}
