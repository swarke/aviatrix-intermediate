// Import componenets
import {Component, OnInit} from '@angular/core';
import { PropertiesService } from '../../services';


@Component({
  // moduleId: module.id,
  selector: 'spinner',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
/**
 * Loader component
 */
export class LoaderComponent implements OnInit {

  /**
   * Contructor for Loader component
   */
  constructor(public properties: PropertiesService) {
  }

  ngOnInit() {
  }
}