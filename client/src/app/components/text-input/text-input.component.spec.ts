import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextInputComponent } from './text-input.component';
import { AutoFocusDirective } from '../../directives/auto-focus/auto-focus.directive';

fdescribe('TextInputComponent', () => {
	let component: TextInputComponent;
	let fixture: ComponentFixture<TextInputComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [FormsModule, MatTooltipModule],
			declarations: [AutoFocusDirective, TextInputComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(TextInputComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
		expect(component.hasError).toBeFalsy();
		expect(component.isDisabled).toBeFalsy();
		expect(component.matTooltip._isTooltipVisible()).toBeFalsy();
		expect(component.currentValue).toBeUndefined();
	});
});
