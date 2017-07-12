import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MaterialModule } from '@angular/material';
import 'hammerjs';
import { ChartModule } from 'angular2-highcharts';
import { HighchartsStatic } from 'angular2-highcharts/dist/HighchartsService';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoaderComponent } from './loader/loader.component';

import { ApiService } from '../services/api.service';
import { PropertiesService } from '../services/properties.service';
import {PopoverModule} from "ngx-popover";
import { StarRatingModule } from 'angular-star-rating';
import {ShareButtonsModule} from 'ngx-sharebuttons';
import { AppRoutingModule, appRoutingProviders} from './app-routing.module';
import {SlimLoadingBarModule} from 'ng2-slim-loading-bar';



declare var require: any;

export function highchartsFactory() {
    const hc = require('highcharts');
    const dd = require('highcharts/modules/drilldown');
    dd(hc);

    return hc;
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    DashboardComponent,
    LoaderComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    MaterialModule,
    ChartModule,
    PopoverModule,
    StarRatingModule,
    ShareButtonsModule.forRoot(),
    SlimLoadingBarModule.forRoot()
  ],
  providers: [
    ApiService,
    PropertiesService,
    {  
        provide: HighchartsStatic,
        useFactory: highchartsFactory
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
