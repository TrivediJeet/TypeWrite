import { Component, OnInit, Output, EventEmitter, Input, ViewChild, ElementRef } from '@angular/core';

import { MatTooltip} from '@angular/material/tooltip';

@Component({
	selector: 'app-text-input',
	templateUrl: './text-input.component.html',
	styleUrls: ['./text-input.component.scss']
})
export class TextInputComponent implements OnInit {
	// Template reference variable for native input element
	@ViewChild('textInputField') elementRef: ElementRef;
	// Refrence to the 'Fix Typo!' tooltip
	@ViewChild('matTooltip') matTooltip: MatTooltip;
	// The 'model' bound to the input field (it's current value)
	@Input() currentValue: string;
	// Whether to disable the input field
	@Input() isDisabled: boolean;
	// Event raised when a character is typed into the input field
	@Output() inputChanged = new EventEmitter<Event>();
	// Intercept setting hasError to toggle display of tooltip
	@Input() set hasError(errorState: boolean) {
		if (errorState) {
			this.matTooltip.show();
		} else {
			this.matTooltip.hide();
		}
	}

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

	// Prevents mouse events to avoid selection within input field, toggling the tooltip, losing focus, etc.
	public onMouseEvent($event: MouseEvent) {
		$event.preventDefault();
		$event.stopImmediatePropagation();
	}

	// Manually prevents loss of focus from input field
	public onBlur($event: FocusEvent) {
		$event.stopImmediatePropagation();
		$event.preventDefault();
		this.focus();
	}

	// Focuses input field
	public focus() {
		this.elementRef.nativeElement.focus();
	}

	public onKeydown($event: KeyboardEvent) {
		// Prevent arrow keys to avoid moving of caret
		if ($event.key in {ArrowUp: '', ArrowDown: '', ArrowLeft: '', ArrowRight: ''}) {
			$event.preventDefault();
			$event.stopImmediatePropagation();
		}
	}
}
