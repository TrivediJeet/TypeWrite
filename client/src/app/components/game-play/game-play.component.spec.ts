import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material';
import { GamePlayComponent } from './game-play.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RandomParagraphComponent } from '../random-paragraph/random-paragraph.component';
import { TextInputComponent } from '../text-input/text-input.component';
import { AutoFocusDirective } from '../../directives/auto-focus/auto-focus.directive';

describe('GamePlayComponent', () => {
	let component: GamePlayComponent;
	let fixture: ComponentFixture<GamePlayComponent>;
	const mockParagraph = 'There is nothing impossible to him who will try';

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [FormsModule, MatTooltipModule],
			declarations: [RandomParagraphComponent, TextInputComponent, GamePlayComponent, AutoFocusDirective]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(GamePlayComponent);
		component = fixture.componentInstance;

		component.prepareGame();

		spyOn(component.textInput, 'onInput').and.callFake( ($event: any) => {
			if (component.textInput.currentValue) {
				let currVal = component.textInput.currentValue;
				if ($event.inputType === 'deleteContentBackward') {
					component.textInput.currentValue = component.textInput.currentValue.substring(0, component.textInput.currentValue.length - 1);
				} else {
					currVal += $event.data;
					component.textInput.currentValue = currVal;
				}
			} else {
				component.textInput.currentValue = $event.data;
			}
			component.onTextInput($event);
		});

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
		expect(component.randomParagraph).toEqual(mockParagraph);
		expect(component.indexOfFirstError).toBeUndefined();
		expect(component.typedSoFar).toEqual('');
		expect(component.errorState).toBeFalsy();
	});

	it('should handle character input', () => {
		const mockInputEvent = { inputType: 'inserText', data: 'T' };
		component.textInput.onInput(mockInputEvent);

		expect(component.errorState).toBeFalsy();
		expect(component.currentEditingIndex).toEqual(1);
		expect(component.typedSoFar).toEqual('T');
	});

	it('should handle backspace', () => {
		let mockInputEvent = { inputType: 'inserText', data: 'T' } as any;
		component.textInput.onInput(mockInputEvent);

		mockInputEvent = { inputType: 'inserText', data: 'h' };
		component.textInput.onInput(mockInputEvent);

		expect(component.errorState).toBeFalsy();
		expect(component.currentEditingIndex).toEqual(2);
		expect(component.typedSoFar).toEqual('Th');

		mockInputEvent = { inputType: 'deleteContentBackward'};
		component.textInput.onInput(mockInputEvent);

		expect(component.errorState).toBeFalsy();
		expect(component.currentEditingIndex).toEqual(1);
		expect(component.typedSoFar).toEqual('T');
	});

	it('should handle errors', () => {
		let mockInputEvent = { inputType: 'inserText', data: 'T' } as any;
		component.textInput.onInput(mockInputEvent);

		mockInputEvent = { inputType: 'inserText', data: 'h' };
		component.textInput.onInput(mockInputEvent);

		expect(component.errorState).toBeFalsy();
		expect(component.currentEditingIndex).toEqual(2);
		expect(component.typedSoFar).toEqual('Th');

		mockInputEvent = { inputType: 'inserText', data: 'Z' };
		component.textInput.onInput(mockInputEvent);

		expect(component.currentEditingIndex).toEqual(3);
		expect(component.errorState).toBeTruthy();
		expect(component.indexOfFirstError).toEqual(3);
		expect(component.typedSoFar).toEqual('ThZ');
	});

	it('should get the next wordToAttempt from the que after completing a word', () => {
		let mockInputEvent = { inputType: 'inserText', data: 'T' } as any;
		component.textInput.onInput(mockInputEvent);
		mockInputEvent = { inputType: 'inserText', data: 'h' };
		component.textInput.onInput(mockInputEvent);
		mockInputEvent = { inputType: 'inserText', data: 'e' };
		component.textInput.onInput(mockInputEvent);
		mockInputEvent = { inputType: 'inserText', data: 'r' };
		component.textInput.onInput(mockInputEvent);
		mockInputEvent = { inputType: 'inserText', data: 'e' };
		component.textInput.onInput(mockInputEvent);

		const getNextWordSpy = spyOn(component, 'getNextWordToAttempt').and.callThrough();

		mockInputEvent = { inputType: 'inserText', data: ' ' };
		component.textInput.onInput(mockInputEvent);

		expect(getNextWordSpy).toHaveBeenCalled();
		expect(component.currentEditingIndex).toBe(0);

		mockInputEvent = { inputType: 'inserText', data: 'i' };
		component.textInput.onInput(mockInputEvent);

		expect(component.errorState).toBeFalsy();
		expect(component.currentEditingIndex).toEqual(1);
		expect(component.typedSoFar).toEqual('There i');
	});
});
