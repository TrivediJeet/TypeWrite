import { Component, OnInit, Input } from '@angular/core';

@Component({
	selector: 'app-performance-metrics',
	templateUrl: './performance-metrics.component.html',
	styleUrls: ['./performance-metrics.component.scss']
})
export class PerformanceMetricsComponent implements OnInit {
	@Input() elapsedTime: string;
	@Input() wpm: string;
	@Input() accuracy: string;

	constructor() { }

	ngOnInit() {
	}

}
