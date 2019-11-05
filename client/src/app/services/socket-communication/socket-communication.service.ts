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

	sendStatus(completionPercentage: number) {
		this.socket.emit('clientStatusUpdate', completionPercentage);
	}

	enQueue() {
		this.socket.emit('enQueue');
	}

	// TODO: Complete overhaul
	getMessages(): Observable<any> {
		const observable = new Observable(observer => {
			this.socket.on('SessionStarted', (message) => {
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
