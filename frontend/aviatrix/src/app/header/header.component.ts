// Import components
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { PropertiesService } from '../../services';
import { CLOUD_TOOL} from '../app-config';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None
})

// Header component
export class HeaderComponent implements OnInit {
  
  /**
   * Contructor for Header component
   */
  constructor(public properties: PropertiesService,
  			  private titleService: Title,
          private router: Router,
          private route:ActivatedRoute) {
  	this.initToolName();
  }

  ngOnInit() {
  }

  /**
   * Set the title name
   */
  initToolName() {
    this.titleService.setTitle('Cloud Network Tools (powered by Aviatrix)');
  }

}
