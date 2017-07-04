import { Component } from '@angular/core';
import { PropertiesService } from '../services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  viewProviders: [PropertiesService]
})
export class AppComponent {
 
 constructor() {
 	
 }
}
