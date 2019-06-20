import { Component, OnInit, Output, EventEmitter, Input, ViewChild, ElementRef } from '@angular/core';

@Component({
	selector: 'app-text-input',
	templateUrl: './text-input.component.html',
	styleUrls: ['./text-input.component.scss']
})
export class TextInputComponent implements OnInit {
	// Template reference variable for native input element
	@ViewChild('textInputField') nameInputRef: ElementRef;
	// The 'model' bound to the input field (it's current value)
	@Input() currentValue: string;
	// Whether to disable the input field
	@Input() isDisabled: boolean;
	// Event raised when a character is typed into the input field
	@Output() inputChanged = new EventEmitter<Event>();

	constructor() {
	}

	ngOnInit() {
	}

	// Emits the input changed event
	public onInput($event: any) {
		if (this.inputChanged) {
			this.inputChanged.emit($event);
		}
	}

	// Prevent mouse down to avoid selection within input field
	public onMouseDown($event: MouseEvent) {
		$event.preventDefault();
	}

	// Prevent loss of focus of input field
	public onBlur($event: FocusEvent) {
		$event.stopImmediatePropagation();
		$event.preventDefault();
		this.nameInputRef.nativeElement.focus();
	}
}
