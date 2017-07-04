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
    apiRequest.addProperty('timestamp', speedTest.timestamp);
    console.log('api: ', apiRequest);
    return this._apiService.executeAPI(apiRequest);
//     return {
//   "data": [
//     {
//       "latency": 473.136,
//       "source_region": "us-east-1",
//       "throughput": 10.88436558842513,
//       "destination_region": "eu-west-1",
//       "time": "2017-07-04T05:10:22.268Z"
//     },
//     {
//       "latency": 611.7629999999999,
//       "source_region": "us-east-1",
//       "throughput": 8.237669958576877,
//       "destination_region": "us-west-1",
//       "time": "2017-07-04T05:10:22.268Z"
//     },
//     {
//       "latency": 424.236,
//       "source_region": "us-east-1",
//       "throughput": 8.946036167929623,
//       "destination_region": "eu-west-1",
//       "time": "2017-07-04T05:13:41.057Z"
//     },
//     {
//       "latency": 612.1320000000001,
//       "source_region": "us-east-1",
//       "throughput": 6.9080214217744285,
//       "destination_region": "us-west-1",
//       "time": "2017-07-04T05:13:41.057Z"
//     },
//     {
//       "latency": 412.029,
//       "source_region": "us-east-1",
//       "throughput": 9.560800717060054,
//       "destination_region": "eu-west-1",
//       "time": "2017-07-04T05:16:26.994Z"
//     },
//     {
//       "latency": 515.959,
//       "source_region": "us-east-1",
//       "throughput": 8.105645744373872,
//       "destination_region": "us-west-1",
//       "time": "2017-07-04T05:16:26.994Z"
//     }
//   ]
// }
  }

}
