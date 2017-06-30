import { Injectable, Inject } from '@angular/core';
import { Response } from '@angular/http';
import { APIRequest, APIUrls } from '../models';
import { APIMethod, ApiService } from './api.service';
import { PropertiesService } from './properties.service';
import { Observable } from 'rxjs/Observable';

declare const AWS: any;



@Injectable()
/**
 * @brief      Class for activities service.
 */
export class DashboardService {

  constructor(private _apiService: ApiService,
              private properties: PropertiesService) {
    //this.createAWS();
  }

  getInventory(inventoryPath: any) {
    //'data/inventory.json'
    const apiRequest: APIRequest = new APIRequest(inventoryPath, APIMethod.GET);
    return this._apiService.executeAPI(apiRequest);
  }


  getGeolocation() { 
   const apiRequest: APIRequest = new APIRequest('https://www.googleapis.com/geolocation/v1/geolocate?key=' + this.properties.GOOGLE_API_KEY, APIMethod.POST);
    return this._apiService.executeAPI(apiRequest);
   // return this.http.post(, {});
  };

  getLatencyAndBandwidth(url) {
    const apiRequest: APIRequest = new APIRequest(url, APIMethod.POST);
    return this._apiService.executeAPI(apiRequest);
  }

}
