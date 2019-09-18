import { Injectable } from '@angular/core';

import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class SocketCommunicationService {

	constructor(private socket: Socket) {}

	sendTestMessage(messageToSend: string) {
		this.socket.emit('messageFromClient', messageToSend);
	}

	sendStatus(state: any) {
		this.socket.emit('clientStatusUpdate', state);
	}

	enQueue() {
		this.socket.emit('enQueue');
	}

	// TODO: Complete overhaul
	getMessages(): Observable<any> {
		const observable = new Observable(observer => {
			this.socket.on('GameStarted', (message) => {
				observer.next(message);
			});
			this.socket.on('JoinedSession', (message) => {
				observer.next(message);
			});
			this.socket.on('serverStateUpdate', (message) => {
				observer.next(message);
			});
		});
		return observable;
	}
}
