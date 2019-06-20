import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms'; // <-- NgModel lives here
import { AppComponent } from './app.component';
import { TextInputComponent } from './components/text-input/text-input.component';
import { RandomParagraphComponent } from './components/random-paragraph/random-paragraph.component';
import { HomeDashboardComponent } from './components/home-dashboard/home-dashboard.component';
import { GamePlayComponent } from './components/game-play/game-play.component';
import { BlockCopyPasteCutDirective } from './directives/block-copy-paste-cut/block-copy-paste-cut.directive';
import { AutoFocusDirective } from './directives/auto-focus/auto-focus.directive';

@NgModule({
  declarations: [
    TextInputComponent,
    RandomParagraphComponent,
    HomeDashboardComponent,
    GamePlayComponent,
    BlockCopyPasteCutDirective,
    AutoFocusDirective
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [HomeDashboardComponent]
})
export class AppModule { }
