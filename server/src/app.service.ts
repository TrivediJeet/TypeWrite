import { Logger, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { QuotesService } from './quotes/quotes.service';

interface Player {
  inQueue: boolean;
  inGame: boolean;
  completionPercentage: number;
}

interface Dictionary {
  [key: string]: any;
}

interface PlayerDictionary {
  [socketId: string]: Player;
}

interface Session {
  players: [Player];
  status: string;
  quote: { en: string };
}

@Injectable()
export class AppService {
  private logger: Logger = new Logger('AppService');
  private connectedPlayers: PlayerDictionary = {};
  private sessions: Session[] = [];
  private currentQueuedSession: number = 0;

  constructor(private quotesService: QuotesService) {}

  getHello(): string {
    return 'Hello World!';
  }

  playerConnected(socketId: string): void {
    this.connectedPlayers[socketId] = { inQueue: false, inGame: false, completionPercentage: 0  } as Player;
  }

  playerDisconnected(socketId: string): void {
    delete this.connectedPlayers[socketId];
  }

  queuePlayer(client: Socket): void {
    this.connectedPlayers[client.id].inQueue = true;
    if (this.noActiveQueuedSessions()) {
      this.createNewSessionAndAddPlayer(client);
    } else {
      this.addPlayerToCurrentQueuedSession(client);
    }
  }

  updatePlayerStatus(clientId: number, completionPercentage: number): void {
    this.connectedPlayers[clientId].completionPercentage = completionPercentage;
  }

  private noActiveQueuedSessions(): boolean {
    return this.sessions && !this.sessions[this.currentQueuedSession];
  }

  private createNewSessionAndAddPlayer(client: Socket): void {
    // Block level persistance of this.currentQueuedSession for closures
    const currentActiveSession = this.currentQueuedSession;
    // Join socket room with the name of current queued session count
    client.join(this.currentQueuedSession);

    this.sessions[this.currentQueuedSession] = {
      players: [this.connectedPlayers[client.id]],
      status: 'queued',
      quote: this.quotesService.getRandomQuote(),
    } as Session;

    client.emit('JoinedSession', { caption: 'JoinedSession', sessionState: this.sessions[this.currentQueuedSession] });

    setTimeout(() => {
      if (this.sessions[currentActiveSession].status === 'queued') {
        client.server.in(client.rooms[0]).emit('SessionStarted', { caption: 'SessionStarted', sessionState: {} });
        this.startSession(currentActiveSession, client);
      }
    }, 10000);
  }

  private addPlayerToCurrentQueuedSession(client: Socket): void {
    client.join(this.currentQueuedSession);
    client.emit('JoinedSession', { caption: 'JoinedSession', sessionState: this.sessions[this.currentQueuedSession] });
    this.sessions[this.currentQueuedSession].players.push(this.connectedPlayers[client.id]);

    if (this.sessions[this.currentQueuedSession].players.length >= 5) {
      client.server.in(client.rooms[0]).emit('SessionStarted', { caption: 'SessionStarted', sessionState: {} });
      this.startSession(this.currentQueuedSession, client);
    }
  }

  private startSession(sessionNumber: number, client: Socket): void {
    this.sessions[sessionNumber].status = 'started';
    this.currentQueuedSession++;
    this.setupRoomStatusPolling(sessionNumber, client);
    this.markPlayersInSessionInGame(sessionNumber);
  }

  private setupRoomStatusPolling( sessionNumber: number , client: Socket): void {
    const statusPollingInterval = setInterval(() => {
      client.server.in(client.rooms[0]).emit('serverStateUpdate', { caption: 'serverStateUpdate', sessionState: this.sessions[sessionNumber] });
    }, 2000);
  }

  private markPlayersInSessionInGame(sessionNumber: number): void {
    const session = this.sessions[sessionNumber];
    session.players.forEach(player => {
      player.inGame = true;
      player.inQueue = false;
    });
  }
}
