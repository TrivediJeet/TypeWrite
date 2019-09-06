import 'hammerjs';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatButtonModule } from '@angular/material/button';

import { AppRoutingModule } from './app-routing.module';
import { TextInputComponent } from './components/text-input/text-input.component';
import { RandomParagraphComponent } from './components/random-paragraph/random-paragraph.component';
import { HomeDashboardComponent } from './components/home-dashboard/home-dashboard.component';
import { GamePlayComponent } from './components/game-play/game-play.component';
import { BlockCopyPasteCutDirective } from './directives/block-copy-paste-cut/block-copy-paste-cut.directive';
import { AutoFocusDirective } from './directives/auto-focus/auto-focus.directive';
import { PerformanceMetricsComponent } from './components/performance-metrics/performance-metrics.component';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
const socketConfig: SocketIoConfig = { url: 'http://localhost:8000', options: {} };

@NgModule({
	declarations: [
		TextInputComponent,
		RandomParagraphComponent,
		HomeDashboardComponent,
		GamePlayComponent,
		BlockCopyPasteCutDirective,
		AutoFocusDirective,
		PerformanceMetricsComponent
	],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		MatTooltipModule,
		MatButtonModule,
		FormsModule,
		ReactiveFormsModule,
		AppRoutingModule,
		SocketIoModule.forRoot(socketConfig),
	],
	entryComponents: [
		PerformanceMetricsComponent
	],
	providers: [],
	bootstrap: [HomeDashboardComponent]
})
export class AppModule { }
