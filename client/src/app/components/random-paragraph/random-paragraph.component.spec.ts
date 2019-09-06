import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RandomParagraphComponent } from './random-paragraph.component';

describe('RandomParagraphComponent', () => {
	let component: RandomParagraphComponent;
	let fixture: ComponentFixture<RandomParagraphComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [RandomParagraphComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(RandomParagraphComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
