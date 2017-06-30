import { Component, OnInit, AfterViewInit, ViewEncapsulation, Input } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { ChartModule } from 'angular2-highcharts';
import { DashboardModel, SpeedtestModel} from '../../models';
import { Response, Http } from '@angular/http';
import { DashboardService, PropertiesService } from '../../services';
import { MdDialog, MdDialogRef, MdDialogConfig } from '@angular/material';
import {SlimLoadingBarService} from 'ng2-slim-loading-bar';

declare var jQuery:any;

declare const L: any;

declare const google: any;

declare const AmCharts: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html?v=${new Date().getTime()}',
  styleUrls: ['./dashboard.component.scss?v=${new Date().getTime()}'],
  viewProviders: [DashboardService],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit, AfterViewInit  {
  clouds: any;
  @Input() tool: string;
  progressFactor: number = 0;

  sourceTab: boolean;
  destinationTab: boolean;
  testTab: boolean;

  options: any;
  latencyOptions: any;
  isTestCompleted: boolean;
  responseTimeOptions: any;
  bandwidthOptions: any;
  packetLossOptions: any;
  throughputOptions: any;
  lat: number;
  lng: number;
  geoLocation: any;
  errorMessage: any;

  locations: any;

  sourceCloudRegion: any;
  sourceCloudRegions: any[];
  destinationRegions: any[];
  awsRegions: any[];
  azureRegions: any[];
  gceRegions: any[];
  selectedDestinationCloudRegions: any;

  inventory: any;
  selectedTabIndex: any;

  dashboardModel: DashboardModel;
  speedtestModel: SpeedtestModel
  pingStartTime: any =  null;

  TEST_MINUTES: number = 35;
  TEST_INTERVAL: number = 5000;

  latency: any;
  bandwidth: any;
  responseTime: any;
  throughput: any;

  latencyChart: any;

  disabledStart: any;

  responseTimeChart : any;
  bandwidthChart: any;
  selectedRegions: any;
  sourceCloudProvider: any;
  destinationCloudProvider: any;
  bestRegion: any;
  worstRegion: any;

  bestLatencyRegion: any;
  bestBandwidthRegion: any;

  mapStyles: any;
  isDesc: boolean;
  sortableColumn: any;
  leftPanelHeader:any;
  inventoryPath: any;
  cloudPinPath: any;
  chartColors: any;
  userLocation: any;

  public zoom = 15;
  public opacity = 1.0;
  public width = 5;
  text = '';
  hoveredObject = null;



  constructor(private http: Http,
              private dashboardService: DashboardService,
              public properties: PropertiesService,
              public dialog: MdDialog,
              private slimLoadingBarService: SlimLoadingBarService) {
      
      this.chartColors = ['#2196F3', '#F44336', '#FF609E', '#14936C', '#00FF4F', '#A99000',
                          '#E8C21A', '#673AB7', '#3D495A', '#536DFE', '#C3429B', '#C33A38', 
                          '#02BCA1', '#25DB67', '#6F9900', '#E69500', '#D792F1', '#83A1CD', 
                          '#0E7BBC', '#81D4FA'];
      
      this.userLocation = {};
      this.latency = properties.NA_TEXT;
      this.bandwidth = properties.NA_TEXT;
      this.responseTime = properties.NA_TEXT;
      this.throughput = properties.NA_TEXT;

      this.lat = properties.NA_LATITUDE;
      this.lng = properties.NA_LONGITUDE;    
      
      this.disabledStart = false;
      this.isDesc = false;
      this.sortableColumn = "";
      this.latencyOptions = null;
      this.responseTimeOptions = null;
      this.bandwidthOptions = null;
      this.latencyChart = null;
      this.responseTimeChart = null;
      this.bandwidthChart = null;
      this.dashboardModel = new DashboardModel();
      this.speedtestModel = new SpeedtestModel();
  	  this.clouds = [
                	    {value: '0', viewValue: 'All Cloud'},
                	    {value: '1', viewValue: 'Google Cloud'},
                	    {value: '2', viewValue: 'Azure'}
                	  ];
     this.options = [];

     this.inventory = {};
     this.errorMessage = "";
     this.locations = [];
     this.selectedRegions = [];
     this.bestRegion = null;
     this.worstRegion = null;
     this.bestLatencyRegion = null;
     this.isTestCompleted = false;
     this.sourceTab = true;
     this.destinationTab = false;
     this.testTab = false
     this.selectedTabIndex = 0;
     this.sourceCloudRegion = "";
     this.sourceCloudProvider = "";
     this.destinationCloudProvider = "azure";
  }

  setDestinationCloudProvider(cloud: any) {
    this.destinationCloudProvider = cloud;
  }

  changeTab(tabIndex: any) {
    if(tabIndex == 0) {
        this.sourceTab = true;
        this.destinationTab = false;
        this.testTab = false
        this.selectedTabIndex = 0;
    } else if(tabIndex == 1) {
        this.sourceTab = false;
        this.destinationTab = true;
        this.selectedTabIndex = 1;
        this.testTab = false
    } else if(tabIndex == 2) {
        this.sourceTab = false;
        this.destinationTab = false;
        this.testTab = true;
        this.selectedTabIndex = 2;
    }
  }
  changeMDTab(selectedTab: any) {
    this.changeTab(selectedTab.index);
    console.log('gggg: ', this.speedtestModel.destinationCloudRegions);
  }

  validationSourceTab() {
    if(this.speedtestModel.sourceCloudProvider && this.speedtestModel.sourceCloudRegion) {
      return true;
    }
    return false;
  }

  backTab() {
    if(this.destinationTab) {
      this.changeTab(0);
    } else if(this.testTab) {
      this.changeTab(1);
    }
  }

  nextTab() {
    if(this.sourceTab) {
      this.changeTab(1);
    } else if(this.destinationTab) {
      this.changeTab(2);
    }
  }

  openDialog() {
   // set progress bar as complete 
   this.slimLoadingBarService.complete();
   this.slimLoadingBarService.reset();
   this.slimLoadingBarService.progress = 0;
   let config = new MdDialogConfig();
   let dialogRef:MdDialogRef<ModalComponent> = this.dialog.open(ModalComponent, config);
   dialogRef.componentInstance.bestLatencyRegion = this.bestLatencyRegion;
   dialogRef.componentInstance.bestBandwidthRegion = this.bestBandwidthRegion;
 }

  latencyInstance(chartInstance) {
    this.latencyChart = chartInstance;
  }

  responseTimeInstance(chartInstance) {
    this.responseTimeChart = chartInstance;
  }

  bandwidthInstance(chartInstance) {
    this.bandwidthChart = chartInstance;
  }

  ngOnInit() {
    

  }

  ngAfterViewInit() {
    let self = this;
    self.getInvetory();
    self.dashboardModel.awsRegions = self.dashboardModel.locations.aws;
    self.dashboardModel.azureRegions = self.dashboardModel.locations.azure;
    self.dashboardModel.gceRegions = self.dashboardModel.locations.gce;
  }

  changeSourceCloudProvider() {
    this.sourceCloudRegions = this.dashboardModel.locations[this.speedtestModel.sourceCloudProvider]
  }

  changeSourceRegion() {
    // console.log('provider: ', this.sourceCloudProvider);
    // console.log('regions: ', this.sourceCloudRegion);
  }

  isRegionsSelected(region: any) {
    for (let index = 0; index < this.speedtestModel.destinationCloudRegions[this.destinationCloudProvider].length; index++) {
      if(region.cloud_info.region === this.speedtestModel.destinationCloudRegions[this.destinationCloudProvider][index]['cloud_info']['region'] && region.public_ip === this.speedtestModel.destinationCloudRegions[this.destinationCloudProvider][index]['public_ip']) {
        this.speedtestModel.destinationCloudRegions[this.destinationCloudProvider].splice(index, 1);
        for (let step = 0; step < this.speedtestModel.destinationRegions.length; step++) {
          if(region.cloud_info.region === this.speedtestModel.destinationRegions[step]['cloud_info']['region'] && region.public_ip === this.speedtestModel.destinationRegions[step]['public_ip']) {
            this.speedtestModel.destinationRegions.splice(step, 1);
          }
        }
        return true;
      }
    }
    return false
  }

  changeRegionState(region: any) {
    
    if(!this.isRegionsSelected(region)) {
      this.speedtestModel.destinationRegions.push(region);
      this.speedtestModel.destinationCloudRegions[this.destinationCloudProvider].push(region);
    } 
    console.log('regions: ', this.selectedDestinationCloudRegions);
  }


  getCurrentGeoLocation() {
     let current = this;
      this.getGeolocation().subscribe((geoLocation:   any) => {
      current.geoLocation = JSON.parse(geoLocation._body);
       let locs: any[] = current.geoLocation.loc.split(',');
       current.lat = parseFloat(locs[0]);
       current.lng = parseFloat(locs[1]);
       current.locations.push({
                              lat: parseFloat(locs[0]),
                              lng: parseFloat(locs[1]),
                              label: 'User location : ' + current.geoLocation.city,
                              draggable: false
                            });

       for(let index = 0; index < this.inventory.data.length; index++) {
         let obj = this.inventory.data[index];
         current.locations.push(obj);
       }
       
    })
  }

  getGeolocation() {
   return this.http.post('https://www.googleapis.com/geolocation/v1/geolocate?key=' + this.properties.GOOGLE_API_KEY, {});
   // return this.http.get("https://freegeoip.net/json/");
  };

  getSeriesData(chartType: any, name: any, data: any) {
    return {
              type:   chartType,
              name:   name,
              data:   data,
              dataLabels : {
                    enabled : false
              },
              shadow: {
                width: 3,
                offsetX: 0,
                offsetY: 0,
                opacity: 0.06
            }
    };
  }

  getChartConfig (title: any, unit: any, series: any, chartType: any) {
     const options = {
          chart:   { type:  chartType, zoomType:   'xy',
                      style: {
                        fontFamily: 'Roboto, sans-serif'
                      }
           },
          title :   { text :   title },
          colors: this.chartColors,
          global :   {
            useUTC :   false,
          },
          xAxis:   {
              type:   'datetime',
              tickInterval: 5000,
              dateTimeLabelFormats: {
                second: '%H:%M:%S'
              },
              startOnTick: true
          },
          yAxis:   {
                  labels:   {
                    format: '{value}'
                  },
                  title:   {
                    text: unit
                  }
          },
          series: series
      };
      return options;
    }


  /**
   * [getChartData description]
   * @param {[type]} chartData [description]
   */
  getChartData(chartData) {
    const metricData: any = [];
    for (let index = 0; index < chartData.length; index++) {
      const jsonObj = chartData[index];
      // if (jsonObj.value !== null) {
        const date: Date = new Date(jsonObj.time);
        let yVal = jsonObj.value;
  
        metricData.push([Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(),
         date.getHours(), date.getMinutes(), date.getSeconds()), yVal]);
      // }
    }

    return metricData;
  }

  /**
   * [getChartPoint description]
   * @param {[type]} date  [description]
   * @param {[type]} value [description]
   */
  getChartPoint(date, value) {
    return [Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(),
         date.getHours(), date.getMinutes(), date.getSeconds()), value];
  }

  /**
   * Starts test for calculating the statistics.
   */

  startTest() {
  }

  setDataPoint(data, obj) {
    for (var index = 0; index < 6; index++) {
      if (index == 0) {
        data.push({'time': new Date(), 'value': null});
      } else {
        let date = new Date()
        date.setSeconds(obj.pingStartTime.getSeconds() + (index * 5));
        data.push({'time': date, 'value': null});
      }
    }
  }  

  /**
   * [getTimeDiff description]
   */
  getTimeDiff() {
    let endTime:any = new Date();
    let diff: any = endTime - this.pingStartTime;

    var diffMins = Math.round(((diff % 86400000) % 3600000) / 60000);
    return diffMins;
  }


  /**
   * [getTimeDiffInSeconds description]
   */
  getTimeDiffInSeconds(pingStartTime, index) {
    let endTime:any = new Date();
    let diff: any = endTime.getTime() - pingStartTime.getTime();

    var diffSec = diff/ 1000;
    return diffSec;
  }


  getInvetory() {

    for (let key in this.dashboardModel.inventoryPath) {
      let path = this.dashboardModel.inventoryPath[key]
      this.locations[key] = [];
      this.dashboardService.getInventory(path).subscribe((inventory: any) => {
        let data = JSON.parse(inventory);
        for(let index = 0; index < data.data.length; index++) {
         let obj = data.data[index];
         obj.label = obj.region_name;
         obj.isOpen = false;
         obj.iconUrl= this.getCloudPinPath(key);
         obj.color = this.chartColors[index];
         this.dashboardModel.locations[key].push(obj);
        }
        // let totalRegions = this.locations.length * 12;
        // this.progressFactor = 100/totalRegions;
        // this.generateMap();
        this.generateAmMap();
      },
        (error: any) => this.handleError(error)
      );

    }
    console.log('data: ', this.locations);
    
  }

  handleError(error: any) {

  }

  getCloudPinPath(key: any) {
    if (key == "aws") {
      return this.properties.AWS_CLOUD_PIN_PATH;
    } else if (key == "azure") {
      return this.properties.AZURE_CLOUD_PIN_PATH;
    } else if (key == "gce") {
      return this.properties.GCE_CLOUD_PIN_PATH;
    }
  }

  stopTest() {
    // set progress bar as complete 
    this.slimLoadingBarService.progress = 0;
    this.slimLoadingBarService.complete();
    this.disabledStart = false;
  }

  updateMarkerLabel(marker) {
    let latency = "";
    let responseTime = "";
    let bandwith = "";

    if (marker.latencyCompleted && marker.latency) {
      latency = marker.latency;
    } else if(marker.dashboardModel && marker.dashboardModel.latency
              && marker.dashboardModel.latency.length > 0 && marker.currentLatencyIndex > 0) {
      latency = marker.dashboardModel.latency[marker.currentLatencyIndex - 1].value;
    }


    if (marker.bandwidthCompleted && marker.bandwidth) {
      bandwith = marker.bandwidth;
    } else if(marker.dashboardModel && marker.dashboardModel.bandwidth
              && marker.dashboardModel.bandwidth.length > 0 && marker.currentBandwidthIndex > 0) {
      bandwith = marker.dashboardModel.bandwidth[marker.currentBandwidthIndex - 1].value;
    }

    let content = "";

    if(latency == "" && bandwith == "") {
      content = "<strong>" + marker.region_name +"</strong>";
    } else {
      content = '<table class="table table-bordered" width="100%">' +
                    '<thead>' + 
                      '<tr> <th style="text-align: center; border-top: none" colspan="2">'+ marker.region_name +'</th></tr>' +
                      '<tr> <th style="text-align: center">'+ "Latency <br> (msec)"+'</th> <th style="text-align: center">'+ 'Throughput <br> (mbps)' +'</th></tr>' +
                    '</thead>' +
                    '<tbody>' +
                      '<tr><td style="text-align: center;">'+(latency == "" ? this.properties.NA_TEXT : latency) +'</td> <td style="text-align: center;">' + (bandwith == "" ? this.properties.NA_TEXT : bandwith) +'</td></tr>' +
                    '</tbody>' +
                  '</table>';
    }
    
    return content;
  }

  /**
   * [readLatestLatency description]
   * @param {[type]} obj [description]
   */
  readLatestLatency(obj) {
    if (obj.latencyCompleted && obj.latency) {
      return  obj.latency;
    } else if(obj.dashboardModel && obj.dashboardModel.latency
              && obj.dashboardModel.latency.length > 0 && obj.currentLatencyIndex > 0) {
      return obj.dashboardModel.latency[obj.currentLatencyIndex - 1].value;
    }

    return this.properties.CALCULATING_TEXT;
  }

  readLatestThroughput(obj) {
    if (obj.bandwidthCompleted && obj.bandwidth) {
      return obj.bandwidth;
    } else if(obj.dashboardModel && obj.dashboardModel.bandwidth
              && obj.dashboardModel.bandwidth.length > 0 && obj.currentBandwidthIndex > 0) {
      return obj.dashboardModel.bandwidth[obj.currentBandwidthIndex - 1].value;
    }

     return this.properties.CALCULATING_TEXT;
  }

  sortBy (property) {
    this.sortableColumn = property;
    this.isDesc = !this.isDesc; //change the direction    
    let direction = this.isDesc ? 1 : -1;

    this.locations.sort(function(a, b) {
       let aProp = null;
       let bProp = null;
       if(property != 'region_name') {
         aProp = parseFloat(a[property]);
         bProp = parseFloat(b[property]);
       } else {
         aProp = a[property];
         bProp = b[property];
       }

        if(aProp < bProp) {
            return -1 * direction;
        }
        else if( aProp > bProp) {
            return 1 * direction;
        }
        else{
            return 0;
        }
    });
  }

  updateChartOnMarker(marker: any, hide: boolean) {
    if (this.latencyChart && this.latencyChart.series) {
      for(let index = 0; index < this.latencyChart.series.length; index++) {
        if(this.latencyChart.series[index].name !== marker.cloud_info.region && hide) {
          this.latencyChart.series[index].setVisible(false, false);

          if (this.bandwidthChart && this.bandwidthChart.series) {
            this.bandwidthChart.series[index].setVisible(false, false);
          }
        } else {
          this.latencyChart.series[index].setVisible(true, false);
          this.bandwidthChart.series[index].setVisible(true, false);
          if(hide) {
            this.latencyChart.series[index].update({
              dataLabels: {
                  enabled: true
              }
            }, false);

            this.bandwidthChart.series[index].update({
              dataLabels: {
                  enabled: true
              }
            }, false);
          } else {
            this.latencyChart.series[index].update({
              dataLabels: {
                  enabled: false
              }
            }, false);

            this.bandwidthChart.series[index].update({
              dataLabels: {
                  enabled: false
              }
            }, false);
          }
        }
      }
      this.latencyChart.redraw();
      this.bandwidthChart.redraw();    
    }
  }

  generateMap() {
    let self = this;
    var map = L.map('map', { zoomControl:false }).setView([self.userLocation.latitude, self.userLocation.longitude], 1);
    map.options.minZoom = 1;

    L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
    }).addTo(map);

    var userIcon = L.icon({
        iconUrl: self.userLocation.iconUrl,
        iconSize: [22, 39],
    });

    var userMarker = L.marker([self.userLocation.latitude, self.userLocation.longitude], {'icon': userIcon});

    userMarker.addTo(map);

    var userPopup = null;
    
    userMarker.on('mouseover', function (e) {
      userPopup = L.popup()
           .setLatLng([self.userLocation.latitude, self.userLocation.longitude])
           .setContent(self.userLocation.address ? self.userLocation.address : "NA")
            .openOn(map);
    });

    userMarker.on('mouseout', function (e) {
      if(userPopup) {
          map.closePopup(userPopup);
        }
    });

    for(let index = 0; index < this.locations.length; index++ ) {
      let object = this.locations[index];

      var markerIcon = L.icon({
        iconUrl: object.iconUrl,
        iconSize: [22, 39],
      });

      var marker = L.marker([object.lat, object.lng], {'icon': markerIcon});

      marker.addTo(map);
      var layerPopup = null;
      marker.on('mouseover', function (e) {
        var content = self.updateMarkerLabel(object);
        self.updateChartOnMarker(object, true);
        layerPopup = L.popup()
           .setLatLng([object.lat, object.lng])
           .setContent(content)
            .openOn(map);

      });
      marker.on('mouseout', function (e) {
        if(layerPopup) {
          self.updateChartOnMarker(object, false);
          map.closePopup(layerPopup);
        }
      });

      var polyline = L.polyline([[self.userLocation.latitude, self.userLocation.longitude], [object.lat, object.lng]], {color: object.color, weight: 1}).addTo(map);
      polyline.addTo(map);


      // L.Polyline.Arc([self.userLocation.latitude, self.userLocation.longitude], [object.lat, object.lng], {color: object.color,  weight: 1,
      // vertices: 50}).addTo(map);
    }
  }

  generateAmMap() {
    let self = this;

    var lines = [];
    var images = [];
    var planeSVG = "m2,106h28l24,30h72l-44,-133h35l80,132h98c21,0 21,34 0,34l-98,0 -80,134h-35l43,-133h-71l-24,30h-28l15,-47";


    if(self.userLocation.latitude && self.userLocation.longitude) {
      var userImg= {
            "id": "user",
            "imageURL": self.userLocation.iconUrl,
            "width": 22,
            "height": 22,
            "title": function() {
             return self.userLocation.address ? '<b>You are here</b><br>' + self.userLocation.address : "NA";
           },

            "latitude": self.userLocation.latitude,
            "longitude": self.userLocation.longitude,
            "scale": 1
      }

      images.push(userImg);
    }

    for(let index = 0; index < this.locations.length; index++) {
      let object = this.locations[index];

      if(self.userLocation.latitude && self.userLocation.longitude) {
      // Creating lines
        var line = {
            "id": "line" + index,
            "latitudes": [ self.userLocation.latitude, object.lat ],
            "longitudes": [ self.userLocation.longitude, object.lng ],
            "color": object.color,
            "arc": -0.85,
            "thickness" : 2
        };
        
        lines.push(line);
      }

      var regionImg= {
          "id": object.cloud_info.region,
          "imageURL": object.iconUrl,
          "width": 22,
          "height": 39,
          "title": function() {
            if(!self.hoveredObject || self.hoveredObject.id != object.cloud_info.region) {
              self.hoveredObject = object;
              self.hoveredObject.content = self.updateMarkerLabel(object);
            } 
            
            return self.hoveredObject.content;
          },
          "latitude": object.lat,
          "longitude": object.lng,
          "scale": 1
      }

      images.push(regionImg);

      // images.push({
      //   "imageURL": 'assets/E24725.svg',
      //   "positionOnLine": 0,
      //   "color": "#585869",
      //   "animateAlongLine": true,
      //   "lineId": "line" + index,
      //   // "flipDirection": true,
      //   "loop": true,
      //   "scale": 0.03,
      //   "positionScale": 1.8
      // });
    }

    

    var map = AmCharts.makeChart( "map", {
      "type": "map",
      "theme": "light",
      "dataProvider": {
        "map": "worldLow",
        "zoomLevel": 1.4,
        "lines": lines,
        "images": images
      },

      "areasSettings": {
        alpha: 0.5,
        unlistedAreasColor: '#BBBBBB'
      },

      "imagesSettings": {
        color: '#585869',
        rollOverColor: '#585869',
        selectedColor: '#585869',
        "adjustAnimationSpeed": false
      },

      "linesSettings": {
        "arc": -0.7, // this makes lines curved. Use value from -1 to 1
        // "arrow": "middle",
        // "arrowSize": 6,
        color: '#585869',
        thickness: 2,
        alpha: 0.7,
        balloonText: '',
        bringForwardOnHover: false,
      },

      "backgroundZoomsToTop": true,
      "linesAboveImages": true,
      
    } );
   
   map.balloon.textAlign = 'left';
 
   map.addListener("rollOverMapObject", function (event) {
     if(event && event.mapObject) {
       if(event.mapObject.objectType == "MapImage") {
         let region  = self.getRegionForImage(event.mapObject.id);
         if(region) {
           self.updateChartOnMarker(region, true);
         }
       }
     }
   });

   map.addListener("rollOutMapObject", function (event) {
       if(event && event.mapObject) {
         if(event.mapObject.objectType == "MapImage") {
           let region  = self.getRegionForImage(event.mapObject.id);
           if(region) {
             self.updateChartOnMarker(region, false);
           }
         }
       }
    });
  }

  getRegionForImage(regionId) {
    for(let index = 0; index < this.locations.length; index++) {
      let location = this.locations[index];
      if(location.cloud_info.region === regionId) {
        return location;
      }
    }
    return null;
  }

}

// just an interface for type safety.
interface marker {
  lat: number;
  lng: number;
  label?: string;
  draggable: boolean;
}


