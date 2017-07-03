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
    // return this._apiService.executeAPI(apiRequest);
    return {
    "data": [
              {
                "latency": 387.135,
                "source_region": "europe-west1-c",
                "throughput": 11.4844712722,
                "destination_region": "Australia-East",
                "time": "1970-01-01T00:24:58.969212128Z"
              },
              {
                "latency": 458.551,
                "source_region": "europe-west1-c",
                "throughput": 5.92724133445,
                "destination_region": "Canada-East",
                "time": "1970-01-01T00:24:58.969212128Z"
              },
              {
                "latency": 369.689,
                "source_region": "europe-west1-c",
                "throughput": 7.11692358168,
                "destination_region": "Australia-Southeast",
                "time": "1970-01-01T00:24:58.969212128Z"
              }
    ]
    }
  }

}
