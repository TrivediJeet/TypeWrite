import { AutoFocusDirective } from './auto-focus.directive';

import { DebugElement, Component } from '@angular/core';
import { TestBed, ComponentFixture, fakeAsync, tick, flush, flushMicrotasks } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

@Component({
	template: '<input type="text" [appAutoFocus]="true">'
})
class TestAutoFocusComponent {
}

describe('AutoFocusDirective', () => {

	let component: TestAutoFocusComponent;
	let fixture: ComponentFixture<TestAutoFocusComponent>;
	let inputElement: DebugElement;
	let spy;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [TestAutoFocusComponent, AutoFocusDirective]
		});
		fixture = TestBed.createComponent(TestAutoFocusComponent);
		component = fixture.componentInstance;
		inputElement = fixture.debugElement.query(By.css('input'));
		spy = spyOn(inputElement.nativeElement, 'focus');
		fixture.detectChanges();
	});

	it('should create an instance', fakeAsync(() => {
		const directive = new AutoFocusDirective(inputElement.nativeElement);
		expect(directive).toBeTruthy();
	}));
});
