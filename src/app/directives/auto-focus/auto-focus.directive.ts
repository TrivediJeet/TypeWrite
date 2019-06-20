import { Directive, Input, ElementRef, AfterViewInit } from '@angular/core';

@Directive({
	selector: 'input[appAutoFocus]'
})
export class AutoFocusDirective implements AfterViewInit {
	// tslint:disable-next-line:no-input-rename
	@Input('appAutoFocus') private focused = false;

	element: ElementRef<HTMLElement>;

	constructor(public elementRef: ElementRef<HTMLElement>) {
		this.element = elementRef;
		console.log('instantiated');
	}

	ngAfterViewInit(): void {
		if (this.focused) {
			// Set timeout to avoid conflict with current digest cycle
			setTimeout(
				() => this.element.nativeElement.focus()
			, 0);
		}
	}

}
