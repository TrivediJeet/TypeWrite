import { Test, TestingModule } from '@nestjs/testing';
import { AppGateway } from './app.gateway';
import { AppService } from './app.service';
import { QuotesService } from './quotes/quotes.service';
import { HttpModule } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

describe('AppGateway', () => {
  let gateway: AppGateway;
  let service: AppService;
  const mockSocket: Socket = {
    id: '007',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [AppGateway, AppService, QuotesService],
    }).compile();

    gateway = module.get<AppGateway>(AppGateway);
    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should add socket to service on gateway connection', () => {
    const mock =  jest.fn();
    service.playerConnected = mock;

    gateway.handleConnection(mockSocket);

    expect(mock).toBeCalledWith(mockSocket.id);
  });

  it('should remove socket from service on gateway disconnection', () => {
    const connectMock =  jest.fn();
    const disconnectMock = jest.fn();
    service.playerConnected = connectMock;
    service.playerDisconnected = disconnectMock;

    gateway.handleConnection(mockSocket);
    expect(connectMock).toBeCalledWith(mockSocket.id);

    gateway.handleDisconnect(mockSocket);
    expect(disconnectMock).toBeCalledWith(mockSocket.id);
  });
});
