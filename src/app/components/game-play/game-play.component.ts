
import { timer, Subscription } from 'rxjs';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';

import { Queue } from 'src/app/data-structures/queue';
import { TextInputComponent } from 'src/app/components/text-input/text-input.component';

@Component({
	selector: 'app-game-play',
	templateUrl: './game-play.component.html',
	styleUrls: ['./game-play.component.scss']
})
export class GamePlayComponent implements OnInit, OnDestroy {
	@ViewChild(TextInputComponent) textInput: TextInputComponent;

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

	constructor() {
		// TODO: create passthrough service to make API calls to fetch meaningful paragraphs
		this.randomParagraph = 'There is nothing impossible to him who will try';
		this.typedSoFar = '';
		this.totalErrorCount = 0;
	}

	ngOnInit() {
		this.populateWordQue();
		this.getNextWordToAttempt();
		this.startTimer();
	}

	ngOnDestroy() {
		if (this.timePassedSubscription) {
			this.timePassedSubscription.unsubscribe();
		}
	}

	// Delegate for backspace press
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

	// Disables input field then calculates performance metrics and logs them to console
	private Win() {
		this.disableInput = true;

		if (this.timePassedSubscription) {
			this.timePassedSubscription.unsubscribe();
		}

		const minutesElapsed = this.totalSecondsElapsed / 60;
		const wordsPerMinute = this.totalNumberOfWords / minutesElapsed;

		const totalCharacters = this.randomParagraph.length;
		const accuracy = (totalCharacters - this.totalErrorCount) / totalCharacters;
		const accuracyPercentage = Math.round(accuracy * 100);

		console.log('You win!');
		console.log('Total elapsed time: ', this.totalSecondsElapsed, ' seconds');
		console.log('Words per minute: ', wordsPerMinute);
		console.log('Accuracy: ', accuracyPercentage, '%');
	}

	// Returns an array of substrings from the given string parameter split using space as the seperator
	private splitParagraph(paragraph: string): string[] {
		return paragraph.split(' ').map((item) => item + ' ');
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

	// Begins a timer after 3 seconds which emits an event every subsequent second
	// and subscribes to the event, setting the totalTimeElapsed member variable accordingly
	private startTimer() {
		const timeElapsedTicker = timer(3000, 1000);
		this.timePassedSubscription = timeElapsedTicker.subscribe((totalSecondsPassed: number) => {
			this.totalSecondsElapsed = totalSecondsPassed;
		});
	}
}
