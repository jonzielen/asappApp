import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { SearchComponent } from './search/search.component';
import { SavedDisplayComponent } from './saved-display/saved-display.component';


@NgModule({
  declarations: [
    AppComponent,
    SearchComponent,
    SavedDisplayComponent
  ],
  imports: [
    BrowserModule,
		HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
