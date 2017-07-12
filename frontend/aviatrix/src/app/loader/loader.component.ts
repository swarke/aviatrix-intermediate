// Imports
import {Component, OnInit} from '@angular/core';
import { PropertiesService } from '../../services';

/**
 * [Component section to set the selector, providers, template, styleUrls and directives.]
 * @param {['app/components/header.component.css']}} {  selector [description]
 */
@Component({
  // moduleId: module.id,
  selector: 'grace-spinner',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
/**
 * Header component
 */
export class LoaderComponent implements OnInit {

  constructor(public properties: PropertiesService) {
  }

  ngOnInit() {
  }
}