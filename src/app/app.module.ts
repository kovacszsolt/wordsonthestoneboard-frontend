import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {AppServiceIndexeddb} from './services/app.service.indexeddb';
import {AppServiceSql} from './services/app.service.sql';
import {AppServiceRemote} from './services/app.service.remote';
import {HighlightSearch} from './app.pipe';

@NgModule({
    declarations: [
        AppComponent,
        HighlightSearch
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpClientModule,
    ],
    providers: [
        AppServiceIndexeddb,
        AppServiceRemote,
        AppServiceSql
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
