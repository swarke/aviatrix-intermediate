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
export class HeaderComponent implements OnInit {
  
  constructor(public properties: PropertiesService,
  			  private titleService: Title,
          private router: Router,
          private route:ActivatedRoute) {
  	this.initToolName();
  }

  ngOnInit() {
  }

  initToolName() {
    this.titleService.setTitle('Cloud Network Tools (powered by Aviatrix)');
  }

}
