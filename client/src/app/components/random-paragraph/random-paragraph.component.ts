import { Component, OnInit, Input } from '@angular/core';

@Component({
	selector: 'app-random-paragraph',
	templateUrl: './random-paragraph.component.html',
	styleUrls: ['./random-paragraph.component.scss']
})
export class RandomParagraphComponent implements OnInit {
	// The bound paragraph
	@Input() paragraph: string;
	// Whether the user has made a typo
	@Input() hasError: boolean;
	// The index of the character the user is currently attempting to type in reference to the bound paragraph
	@Input() currentEditingIndex: number;
	// The index of the first typo in reference to the bound paragraph
	@Input() indexOfFirstError: number;

	// The subset of the paragraph that the user has successfully typed correctly
	public correct: string;
	// The subset of the paragraph that the user has typed incorrectly
	public incorrect: string;
	// The subset of the paragraph that the user is yet to attempt to type
	public remaining: string;

	constructor() {
	}

	ngOnInit() {
	}

	@Input() set typedSoFar(text: string) {
		if (!this.hasError) {
			this.correct = this.paragraph.substring(0, this.currentEditingIndex);
			this.incorrect = '';
			this.remaining = this.paragraph.substring(this.currentEditingIndex, this.paragraph.length);
		} else {
			this.correct = this.paragraph.substring(0, this.indexOfFirstError - 1);
			this.incorrect = (this.indexOfFirstError === this.currentEditingIndex) ?
				this.paragraph.charAt(this.indexOfFirstError - 1) :
				this.paragraph.substring(this.indexOfFirstError - 1, this.currentEditingIndex);
			this.remaining = this.paragraph.substring(this.currentEditingIndex, this.paragraph.length);
		}
	}
}
