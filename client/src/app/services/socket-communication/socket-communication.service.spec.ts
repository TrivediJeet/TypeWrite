import { TestBed } from '@angular/core/testing';

import { SocketCommunicationService } from './socket-communication.service';

describe('SocketCommunicationService', () => {
	beforeEach(() => TestBed.configureTestingModule({}));

	it('should be created', () => {
		const service: SocketCommunicationService = TestBed.get(SocketCommunicationService);
		expect(service).toBeTruthy();
	});
});
