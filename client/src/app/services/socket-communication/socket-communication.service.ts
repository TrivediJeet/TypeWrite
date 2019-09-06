import { Injectable } from '@angular/core';

import { Socket } from 'ngx-socket-io';

@Injectable({
	providedIn: 'root'
})
export class SocketCommunicationService {

	constructor(private socket: Socket) {}

	sendTestMessage(messageToSend: string) {
		this.socket.emit('messageFromClient', messageToSend);
	}
}
