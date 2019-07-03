
import { timer, Subscription } from 'rxjs';
import { Component, OnInit, ViewChild, OnDestroy, ViewContainerRef, Output, EventEmitter } from '@angular/core';

import { Queue } from 'src/app/data-structures/queue';
import { DomService } from 'src/app/services/dom-service/dom.service';
import { PerformanceMetricsComponent } from 'src/app/components/performance-metrics/performance-metrics.component';
import { TextInputComponent } from 'src/app/components/text-input/text-input.component';

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
	public disableInput: boolean;
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
	// Hold refrence to time ticker subscription as member variable so that we can unsubscribe onDestroy
	private timePassedSubscription: Subscription;
	// Service used to dynamically create and destroy component views
	private domService: DomService;
	private viewContainerRef: ViewContainerRef;

	constructor(domService: DomService, viewContainerRef: ViewContainerRef) {
		this.domService = domService;
		this.viewContainerRef = viewContainerRef;
	}

	ngOnInit() {
	}

	ngOnDestroy() {
		if (this.timePassedSubscription) {
			this.timePassedSubscription.unsubscribe();
		}
	}

	public prepareGame() {
		// TODO: create passthrough service to make API calls to fetch meaningful paragraphs
		this.randomParagraph = 'There is nothing impossible to him who will try';
		this.disableInput = true;
		this.typedSoFar = '';
		this.totalErrorCount = 0;
		this.populateWordQue();
		this.getNextWordToAttempt();
	}

	public startGame() {
		this.disableInput = false;
		setTimeout(() => {
			this.textInput.focus();
		}, 0);
		this.startTimer();
	}

	// Delegate for backspace press into the child textInputComponent's input field
	public onBackspace() {
		this.typedSoFar = this.typedSoFar.substring(0, this.typedSoFar.length - 1);
		this.paragraphIndex--;
	}

	// Delegate for character input into the child textInputComponent's input field
	public onCharacterInput(characterValue: string) {
		this.typedSoFar = this.typedSoFar.concat(characterValue);
		this.paragraphIndex++;
	}

	// On input, calls respective delegate method, sets current editing index and calls validateInput
	public onTextInput($event: any) {
		($event.inputType === 'deleteContentBackward') ? this.onBackspace() : this.onCharacterInput($event.data);
		this.currentEditingIndex = this.textInput.currentValue.length;
		this.validateInput();
	}

	private validateInput() {
		if (this.completedCurrentWordToAttempt()) {
			this.getNextWordToAttempt();
		} else {
			this.validateSubstringOfCurrentWordToAttempt();
		}
	}

	// Calls handleError if the user made a typo, otherwise clears error state member variables
	private validateSubstringOfCurrentWordToAttempt() {
		const substrOfCurrentWord = this.currentWordToAttempt.substring(0, this.currentEditingIndex);
		if (this.textInput.currentValue === substrOfCurrentWord) {
			this.errorState = false;
			this.indexOfFirstError = undefined;
		} else {
			this.handleError();
		}
	}

	// Whether the user has completed the current word to attempt
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

		if (this.gameEndedEmitter) {
			this.gameEndedEmitter.emit();
		}

		this.domService.appendComponentAsSibling(PerformanceMetricsComponent, this.viewContainerRef, this.calculatePerformanceMetrics());
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
}
