import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { GamePlayComponent } from './game-play.component';
import { RandomParagraphComponent } from '../random-paragraph/random-paragraph.component';
import { TextInputComponent } from '../text-input/text-input.component';
import { AutoFocusDirective } from '../../directives/auto-focus/auto-focus.directive';

fdescribe('GamePlayComponent', () => {
	let component: GamePlayComponent;
	let fixture: ComponentFixture<GamePlayComponent>;
	const mockParagraph = 'There is nothing impossible to him who will try';

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [FormsModule],
			declarations: [RandomParagraphComponent, TextInputComponent, GamePlayComponent, AutoFocusDirective]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(GamePlayComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create, fetch a random paragraph', () => {
		expect(component).toBeTruthy();
		expect(component.randomParagraph).toEqual(mockParagraph);
	});

	it('should delegate invocation', () => {
		const mockInputEvent = { inputType: 'inserText', data: 'T' };
		component.onTextInput(mockInputEvent);
	});
});
