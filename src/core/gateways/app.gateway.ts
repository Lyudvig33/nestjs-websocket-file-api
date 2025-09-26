import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IJwtConfig, ITokenPayload } from '@core/models';
import { ERROR_MESSAGES } from '@core/messages';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/notifications',
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AppGateway.name);
  private readonly jwtConfig: IJwtConfig;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.jwtConfig = this.configService.get<IJwtConfig>('JWT_CONFIG');
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      const payload: ITokenPayload = this.jwtService.verify(token, {
        secret: this.jwtConfig.secret,
      });

      client.data.userId = payload.id;
      client.join(`user_${payload.id}`);

      this.logger.log(`User ${payload.id} connected with socket ${client.id}`);

      client.emit('connected', {
        message: 'Connected to notifications',
        userId: payload.id,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(
        `Authentication failed for client ${client.id}:`,
        error.message,
      );
      client.emit('error', {
        message: ERROR_MESSAGES.USER_UNAUTHORIZED.message,
      });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    this.logger.log(`User ${userId} disconnected (socket ${client.id})`);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    if (!userId) {
      client.emit('error', { message: 'Unauthorized' });
      return;
    }

    client.join(data.room);
    this.logger.log(`User ${userId} joined room ${data.room}`);

    client.emit('joined_room', {
      room: data.room,
      message: `Joined room ${data.room}`,
    });
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    if (!userId) {
      client.emit('error', { message: 'Unauthorized' });
      return;
    }

    client.leave(data.room);
    this.logger.log(`User ${userId} left room ${data.room}`);

    client.emit('left_room', {
      room: data.room,
      message: `Left room ${data.room}`,
    });
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    if (!userId) {
      client.emit('error', { message: 'Unauthorized' });
      return;
    }

    client.emit('pong', {
      message: 'pong',
      timestamp: new Date().toISOString(),
      userId,
    });
  }

  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user_${userId}`).emit(event, data);
  }

  sendToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
  }

  sendToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  notifyFileUploaded(userId: string, fileData: any) {
    this.sendToUser(userId, 'file_uploaded', {
      message: 'File uploaded successfully',
      file: fileData,
      timestamp: new Date().toISOString(),
    });
  }

  notifyFileDeleted(userId: string, fileId: string) {
    this.sendToUser(userId, 'file_deleted', {
      message: 'File deleted successfully',
      fileId,
      timestamp: new Date().toISOString(),
    });
  }

  notifyUserRegistered(userId: string, userData: any) {
    this.sendToUser(userId, 'user_registered', {
      message: 'User registered successfully',
      user: userData,
      timestamp: new Date().toISOString(),
    });
  }

  notifyUserLoggedIn(userId: string, userData: any) {
    this.sendToUser(userId, 'user_logged_in', {
      message: 'User logged in successfully',
      user: userData,
      timestamp: new Date().toISOString(),
    });
  }

  notifyUserProfileUpdated(userId: string, userData: any) {
    this.sendToUser(userId, 'user_profile_updated', {
      message: 'User profile updated successfully',
      user: userData,
      timestamp: new Date().toISOString(),
    });
  }

  notifyUserAccountDeactivated(userId: string) {
    this.sendToUser(userId, 'user_account_deactivated', {
      message: 'User account deactivated',
      timestamp: new Date().toISOString(),
    });
  }

  notifySystemMessage(
    userId: string,
    message: string,
    type: 'info' | 'warning' | 'error' = 'info',
  ) {
    this.sendToUser(userId, 'system_message', {
      message,
      type,
      timestamp: new Date().toISOString(),
    });
  }

  notifyAllUsers(event: string, data: any) {
    this.sendToAll(event, data);
  }
}
