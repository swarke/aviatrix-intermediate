import { Injectable, Inject } from '@angular/core';
import { Response } from '@angular/http';
import { APIRequest, APIUrls } from '../models';
import { APIMethod, ApiService } from './api.service';
import { PropertiesService } from './properties.service';
import { Observable } from 'rxjs/Observable';
import { DashboardModel, SpeedtestModel, Cloud } from '../models';
import { SERVER_URL, GET_LATENCY_BANDWIDTH_API } from 'app/app-config';



declare const AWS: any;



@Injectable()
/**
 * @brief      Class for activities service.
 */
export class DashboardService {

  constructor(private _apiService: ApiService,
              private properties: PropertiesService) {
  }

  /*
   * Get inventory from s3 
   */
  getInventory(inventoryPath: any) {
    //'data/inventory.json'
    const apiRequest: APIRequest = new APIRequest(inventoryPath, APIMethod.GET);
    return this._apiService.executeAPI(apiRequest);
  }
 
  /*
   * Get latency and bandwith as per timestamp, destination cloud and source cloud from web server 
   */
  getLatencyAndBandwidth(speedTest: SpeedtestModel) {
    let url = SERVER_URL + GET_LATENCY_BANDWIDTH_API;
    let destRegionList = [];
    for (let index = 0; index < speedTest.destinationRegions.length; index++) {
      destRegionList.push(speedTest.destinationRegions[index]['cloud_info']['region'])
    }
    const apiRequest: APIRequest = new APIRequest(url, APIMethod.POST);
    apiRequest.addProperty('cloud_id', Cloud[speedTest.sourceCloudProvider]);
    apiRequest.addProperty('source_region', speedTest.sourceCloudRegion);
    apiRequest.addProperty('destination_regions', destRegionList);
    apiRequest.addProperty('timestamp', speedTest.timestamp);
    return this._apiService.executeAPI(apiRequest);
  }

}
