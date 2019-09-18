import { Component, OnInit, ViewChild } from '@angular/core';

import { DomService } from 'src/app/services/dom/dom.service';
import { GamePlayComponent } from 'src/app/components/game-play/game-play.component';

@Component({
	selector: 'app-home-dashboard',
	templateUrl: './home-dashboard.component.html',
	styleUrls: ['./home-dashboard.component.scss']
})
export class HomeDashboardComponent implements OnInit {
	// Reference to child GamePlayComponent
	@ViewChild(GamePlayComponent) gamePlay: GamePlayComponent;

	// Toggles display of: (start-button) && (game-play-component + play-again-button)
	public gameStarted = false;
	// Toggles display of play-again button
	public gameEnded = false;
	// Service used to dynamically create and destroy component views
	private domService: DomService;

	constructor(domService: DomService) {
		this.domService = domService;
	}

	ngOnInit() {
	}

	onGameEnded() {
		this.gameEnded = true;
	}

	startGame() {
		this.gamePlay.prepareGame();
		this.gameStarted = true;
		this.gameEnded = false;
		this.domService.clearUI();
	}
}
