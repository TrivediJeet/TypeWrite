
import { timer, Subscription } from 'rxjs';
import { Component, OnInit, ViewChild, OnDestroy, ViewContainerRef, Output, EventEmitter } from '@angular/core';

import { Queue } from 'src/app/data-structures/queue';
import { DomService } from 'src/app/services/dom/dom.service';
import { TextInputComponent } from 'src/app/components/text-input/text-input.component';
import { SocketCommunicationService } from 'src/app/services/socket-communication/socket-communication.service';
import { PerformanceMetricsComponent } from 'src/app/components/performance-metrics/performance-metrics.component';

interface IDictionary {
	[key: string]: any;
}

@Component({
	selector: 'app-game-play',
	templateUrl: './game-play.component.html',
	styleUrls: ['./game-play.component.scss']
})
export class GamePlayComponent implements OnInit, OnDestroy {
	// Child TextInputComponent
	@ViewChild(TextInputComponent) textInput: TextInputComponent;
	// Notifies home-dashboard that game ended
	@Output() gameEndedEmitter: EventEmitter<any> = new EventEmitter();

	// The fetched random paragraph to be bound to the child randomParagraphComponent
	public randomParagraph: string;
	// Boolean bound to child textInputComponent which disables its input field
	public disableInput = true;
	// The index of the character the user is currently attempting to type in reference to the currentWordToAttempt
	public currentEditingIndex = 0;
	// The index of the character the user is currently attempting to type in reference to the bound paragraph
	public paragraphIndex = 0;
	// The aggregate of all characters the user has typed so far
	public typedSoFar: string;
	// Whether the user has made a typo
	public errorState: boolean;
	// The index of the first typo in reference to the bound paragraph
	public indexOfFirstError: number;
	// Queue of all remaining words (including their adjacent puncation and/or trailing spaces) that the users has remaining to type
	private queue: Queue<string>;
	// The word the user is currently attempting to type
	private currentWordToAttempt: string;
	// The total number of typos the user has made
	private totalErrorCount: number;
	// The total numbers of seconds since the game began
	private totalSecondsElapsed: number;
	// The total number of words in the fetched paragraph
	private totalNumberOfWords: number;
	// Toggles display of countdown timer
	public showCountdown = false;
	// Model bound to the countdown timer element
	public countdownValue: number;
	// Whether the user is waiting to join a game session
	public inSessionQueue = false;
	// Whether the user is in an active session which is yet to start
	public waitingForSessionToBegin = false;
	// The number of characters in the fetched random paragraph
	private paragraphLength: number;

	// Hold refrence to subscriptions/intervals so we can unsubscribe onDestroy
	private timePassedSubscription: Subscription;
	private socketCommunicationSubscription: Subscription;
	private statusPollingInterval: any;

	constructor(
		private domService: DomService,
		private viewContainerRef: ViewContainerRef,
		private socketService: SocketCommunicationService) {
	}

	ngOnInit() {
		// TODO: Significant refactor (perhaps pull logic out into the communication service)
		this.socketCommunicationSubscription =  this.socketService.getMessages().subscribe((message: any) => {
			switch (message.caption) {
				case 'GameStarted': {
					console.log('game started!');
					this.startCountdownTimer();
					this.waitingForSessionToBegin = false;
					break;
				}
				case 'JoinedSession': {
					console.log('Joined session: ', message);
					this.inSessionQueue = false;
					this.waitingForSessionToBegin = true;

					this.randomParagraph = message.sessionState.quote.en;
					this.paragraphLength = this.randomParagraph.length;
					this.populateWordQue();
					this.getNextWordToAttempt();

					this.totalErrorCount = 0;
					this.disableInput = true;
					this.typedSoFar = '';

					break;
				}
				case 'serverStateUpdate': {
					console.log('Session state update from server: ', message.sessionState);
					break;
				}
				default: {
					console.log('message recieved from server but there is no registered delegate');
					break;
				}
			}
		});
	}

	ngOnDestroy() {
		if (this.timePassedSubscription) {
			this.timePassedSubscription.unsubscribe();
		}
		if (this.socketCommunicationSubscription) {
			this.socketCommunicationSubscription.unsubscribe();
		}
		if (this.statusPollingInterval) {
			clearInterval(this.statusPollingInterval);
		}
	}

	public prepareGame() {
		this.enQueue();
	}

	public startGame() {
		this.disableInput = false;
		setTimeout(() => {
			this.textInput.focus();
		}, 0);
		this.startTimer();
		this.startPollingStateToServer();
	}

	public onBackspace() {
		this.typedSoFar = this.typedSoFar.substring(0, this.typedSoFar.length - 1);
		this.paragraphIndex--;
	}

	public onCharacterInput(characterValue: string) {
		this.typedSoFar = this.typedSoFar.concat(characterValue);
		this.paragraphIndex++;
	}

	public onTextInput($event: any) {
		($event.inputType === 'deleteContentBackward') ? this.onBackspace() : this.onCharacterInput($event.data);
		this.currentEditingIndex = this.textInput.currentValue.length;
		this.validateInput();
	}

	private enQueue() {
		this.inSessionQueue = true;
		this.socketService.enQueue();
	}

	private validateInput() {
		if (this.completedCurrentWordToAttempt()) {
			this.getNextWordToAttempt();
		} else {
			this.validateSubstringOfCurrentWordToAttempt();
		}
	}

	private validateSubstringOfCurrentWordToAttempt() {
		const substrOfCurrentWord = this.currentWordToAttempt.substring(0, this.currentEditingIndex);
		if (this.textInput.currentValue === substrOfCurrentWord) {
			this.errorState = false;
			this.indexOfFirstError = undefined;
		} else {
			this.handleError();
		}
	}

	private completedCurrentWordToAttempt() {
		return this.currentEditingIndex === this.currentWordToAttempt.length  && this.textInput.currentValue === this.currentWordToAttempt;
	}

	// Sets error state member variables accordingly
	private handleError() {
		this.errorState = true;
		this.totalErrorCount++;
		if (!this.indexOfFirstError) {
			this.indexOfFirstError = this.paragraphIndex;
		}
	}

	// Clears input field and resets currentEditingIndex, then if there's another word to attempt sets it by popping from queue, otherwise gg
	public getNextWordToAttempt() {
		this.currentEditingIndex = 0;
		this.textInput.currentValue = '';
		if (this.queue.peek()) {
			this.currentWordToAttempt = this.queue.pop();
		} else {
			this.Win();
		}
	}

	// Ends game and presents performance metrics component
	private Win() {
		this.disableInput = true;
		this.currentEditingIndex = 0;
		this.paragraphIndex = 0;
		this.typedSoFar = undefined;

		if (this.timePassedSubscription) {
			this.timePassedSubscription.unsubscribe();
		}

		if (this.statusPollingInterval) {
			clearInterval(this.statusPollingInterval);
		}

		if (this.gameEndedEmitter) {
			this.gameEndedEmitter.emit();
		}

		this.domService.appendComponentAsSibling(PerformanceMetricsComponent, this.viewContainerRef, this.calculatePerformanceMetrics());
		this.socketService.sendTestMessage('I won!');
	}

	// Returns a dictionary containing computed performance metrics
	private calculatePerformanceMetrics(): IDictionary {
		const minutesElapsed = this.totalSecondsElapsed / 60;
		const wordsPerMinute = Math.round(this.totalNumberOfWords / minutesElapsed);
		const totalCharacters = this.randomParagraph.length;
		const accuracy = (totalCharacters - this.totalErrorCount) / totalCharacters;
		const accuracyPercentage = Math.round(accuracy * 100);

		const metricsDictionary = {
			elapsedTime: this.totalSecondsElapsed,
			wpm: wordsPerMinute ,
			accuracy: accuracyPercentage
		} as IDictionary;

		return metricsDictionary;
	}

	// Returns an array of word strings from the given string 'paragraph' parameter split using space as the seperator
	private splitParagraph(paragraph: string): string[] {
		const words = paragraph.split(' ').map((item) => item + ' ');
		// Trim trailing space on final word
		words[words.length - 1] = words[words.length - 1].trim();
		return words;
	}

	// Populates the Que of words to type from the fetched random paragraph
	private populateWordQue() {
		const q = new Queue<string>();
		let totalNumberOfWords = 0;
		for (const word of this.splitParagraph(this.randomParagraph)) {
			q.push(word);
			totalNumberOfWords++;
		}
		this.queue = q;
		this.totalNumberOfWords = totalNumberOfWords;
	}

	// Begins a timer which emits an event every second
	// and subscribes to the event, setting the totalTimeElapsed member variable accordingly
	private startTimer() {
		const timeElapsedTicker = timer(0, 1000);
		this.timePassedSubscription = timeElapsedTicker.subscribe((totalSecondsPassed: number) => {
			this.totalSecondsElapsed = totalSecondsPassed;
		});
	}

	private startCountdownTimer() {
		this.countdownValue = 10;
		this.showCountdown = true;
		const timeElapsedTicker = timer(0, 1000).subscribe((totalSecondsPassed: number) => {
			if (this.countdownValue-- > 0) {
				return;
			} else {
				this.showCountdown = false;
				timeElapsedTicker.unsubscribe();
				this.startGame();
			}
		});
	}

	private startPollingStateToServer() {
		this.statusPollingInterval = setInterval(() => {
			// Prevent divide by zero exception
			const percentCompleted = (this.paragraphIndex / (this.paragraphLength || 1)) * 100;
			const roundedPercentage = Math.round(percentCompleted);
			this.socketService.sendStatus({ completionPercentage: roundedPercentage });
		}, 1000);
	}
}
