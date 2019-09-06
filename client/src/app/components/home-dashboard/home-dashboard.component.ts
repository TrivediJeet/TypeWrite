import { Component, OnInit, ViewChild } from '@angular/core';
import { timer } from 'rxjs';

import { DomService } from 'src/app/services/dom/dom.service';
import { GamePlayComponent } from 'src/app/components/game-play/game-play.component';

@Component({
	selector: 'app-home-dashboard',
	templateUrl: './home-dashboard.component.html',
	styleUrls: ['./home-dashboard.component.scss']
})
export class HomeDashboardComponent implements OnInit {
	// Child GamePlayComponent
	@ViewChild(GamePlayComponent) gamePlay: GamePlayComponent;

	// Toggles display of 'play again' button
	public gameEnded = false;
	// Toggles display of countdown timer
	public showCountdown = false;
	// Model bound to the countdown timer element
	public countdownValue: number;
	// Service used to dynamically create and destroy component views
	private domService: DomService;

	constructor(domService: DomService) {
		this.domService = domService;
	}

	ngOnInit() {
		this.startGame();
	}

	onGameEnded() {
		this.gameEnded = true;
	}

	startGame() {
		this.gameEnded = false;
		this.domService.clearUI();
		this.gamePlay.prepareGame();
		this.startCountdown();
	}

	// Starts a timer which updates the model bound to the countdown element every second
	// and starts the game after 10 seconds
	startCountdown() {
		this.countdownValue = 10;
		this.showCountdown = true;
		const timeElapsedTicker = timer(0, 1000).subscribe((totalSecondsPassed: number) => {
			if (this.countdownValue-- > 0) {
				return;
			} else {
				this.showCountdown = false;
				timeElapsedTicker.unsubscribe();
				this.gamePlay.startGame();
			}
		});
	}
}
