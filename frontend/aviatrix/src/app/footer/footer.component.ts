// Import components
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { PropertiesService } from '../../services';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  encapsulation: ViewEncapsulation.None
})

// Footer component
export class FooterComponent implements OnInit {
  
  /**
   * Contructor for Footer component
   */
  constructor(public properties: PropertiesService,
  			  private titleService: Title,
          private router: Router,
          private route:ActivatedRoute) {
    // console.log(this.route);
  	this.initToolName();
  }

  ngOnInit() {
  }

  /**
   * Set the title 
   */
  initToolName() {
    this.titleService.setTitle('Cloud Network Tools (powered by Aviatrix)');
  }
}
