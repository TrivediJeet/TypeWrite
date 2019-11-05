import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

import { AppService } from './app.service';

@WebSocketGateway()
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  constructor(private readonly appService: AppService) {}

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');

  @SubscribeMessage('enQueue')
  handleMessage(client: Socket, payload: any): string {
    this.appService.queuePlayer(client);
    return 'Hello world!';
  }
  @SubscribeMessage('clientStatusUpdate')
  clientStatusUpdate(client: Socket, completionPercentage: number): void {
    this.appService.updatePlayerStatus(client.id, completionPercentage);
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.appService.playerConnected(client.id);
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.appService.playerDisconnected(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}
