import { Component, OnInit, AfterViewInit, ViewEncapsulation, Input } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { ChartModule } from 'angular2-highcharts';
import { DashboardModel, SpeedtestModel, ChartModel } from '../../models';
import { Response, Http } from '@angular/http';
import { DashboardService, PropertiesService } from '../../services';
import { MdDialog, MdDialogRef, MdDialogConfig } from '@angular/material';
import { SlimLoadingBarService } from 'ng2-slim-loading-bar';

declare var jQuery: any;

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
export class DashboardComponent implements OnInit, AfterViewInit {
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
  currentTabIndex: any;
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
  speedtestModel: SpeedtestModel;
  chartModel: ChartModel;
  currentSourceRegion: any;
  pingStartTime: any = null;

  TEST_MINUTES: number = 35;
  TEST_INTERVAL: number = 5000;

  latency: any;
  bandwidth: any;
  responseTime: any;
  throughput: any;

  latencyChart: any;

  disabledStart: any;

  responseTimeChart: any;
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
  leftPanelHeader: any;
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
      '#0E7BBC', '#81D4FA', '#EF9A9A', '#81D4FA', '#BDDB75', '#F9C18F',
      '#A4BAB9', '#FF5E5A', '#2AACF4', '#8CB723', '#EFAA0F', '#5AA8A8',
      '#B71C1C', '#0D47A1', '#006600', '#FF9739', '#1B778C', '#46466D',
      '#E65100', '#1D5663', '#FF8ABF', '#9DEF6C', '#FF008C', '#AEC2D6',
      '#42E505', '#D1A579', '#C91871', '#8291D1', '#009600', '#C68979',
      '#AD006B', '#2E56BC', '#A55550', '#C1DC83', '#FA43FF', '#5ECCB7',
      '#B7B567', '#844840', '#CC4CB4', '#00AF91', '#A99000', '#FF8DA0',
      '#9E1283', '#007F73', '#F1626E', '#FCEC98', '#E3A5F2', '#A7C9A7',
      '#F7ED77', '#A5270A', '#C372D6', '#87AA77', '#FFDD00', '#D1B1AA',
      '#9D25BA', '#59824A', '#E5C31C', '#8E7A76', '#810687', '#212121'];

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
    this.chartModel = new ChartModel();
    this.clouds = [
      { value: '0', viewValue: 'All Cloud' },
      { value: '1', viewValue: 'Google Cloud' },
      { value: '2', viewValue: 'Azure' }
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
    this.testTab = false;
    this.currentTabIndex = 0;
    this.selectedTabIndex = 0;
    this.sourceCloudRegion = "";
    this.sourceCloudProvider = "";
    this.destinationCloudProvider = "azure";
    this.speedtestModel.timestamp = this.dashboardModel.timeRanges[0].value;
    this.generateAmMap();
  }

  setDestinationCloudProvider(cloud: any) {
    this.destinationCloudProvider = cloud;
  }

  changeTab(tabIndex: any) {
    if (tabIndex == 0) {
      this.sourceTab = true;
      this.destinationTab = false;
      this.testTab = false
      this.currentTabIndex = 0;
    } else if (tabIndex == 1) {
      this.sourceTab = false;
      this.destinationTab = true;
      this.currentTabIndex = 1;
      this.testTab = false
    } else if (tabIndex == 2) {
      this.sourceTab = false;
      this.destinationTab = false;
      this.testTab = true;
      this.currentTabIndex = 2;
    }
    this.isTestCompleted = false;
    this.disabledStart = false;
  }

  validate() {
    if (this.currentTabIndex == 0) {
      return this.validationSourceTab();
    } else if (this.currentTabIndex == 1) {
      return this.validationDestnationTab();
    } else {
      return true;
    }
  }

  validationSourceTab() {
    if (this.speedtestModel.sourceCloudProvider && this.speedtestModel.sourceCloudRegion) {
      return true;
    }
    return false;
  }

  validationDestnationTab() {
    if (this.speedtestModel.destinationRegions.length) {
      return true;
    }
    this.selectedTabIndex = 1;
    return false;
  }

  backTab() {
    if (this.destinationTab) {
      this.changeTab(0);
    } else if (this.testTab) {
      this.changeTab(1);
    }
  }

  changeMenuTab(tabIndex: any) {
    if(tabIndex < this.currentTabIndex) {
      this.changeTab(tabIndex);
    } else {
      if(this.validate()) {
        this.changeTab(tabIndex);
      }
    }
  }

  nextTab() {
      if (this.sourceTab) {
      this.changeTab(1);
      } else if (this.destinationTab) {
        this.changeTab(2);
      }
  }

  openDialog() {
    // set progress bar as complete 
    this.slimLoadingBarService.complete();
    this.slimLoadingBarService.reset();
    this.slimLoadingBarService.progress = 0;
    let config = new MdDialogConfig();
    let dialogRef: MdDialogRef<ModalComponent> = this.dialog.open(ModalComponent, config);
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

  updateCheckbox(region: any) {
    region.isSelected = !region.isSelected;
    if (!this.isRegionsSelected(region)) {
      region.isSelected = true;
      this.speedtestModel.destinationRegions.push(region);
      this.speedtestModel.destinationCloudRegions[this.destinationCloudProvider].push(region);
    }
    this.generateAmMap();
  }

  changeSourceRegion() {
    // console.log('provider: ', this.sourceCloudProvider);
    console.log('regions: ', this.speedtestModel.sourceCloudRegion);
    this.chartModel.clearModel();
    this.getCurrentSourceRegion();
    this.clearGraphAndChart();
    this.generateAmMap();
  }

  clearGraphAndChart() {
    this.speedtestModel.clearDestinationCloudRegions();
    this.speedtestModel.destinationRegions = [];
    for (let index = 0; index < this.dashboardModel.awsRegions.length; index++) {
      this.dashboardModel.awsRegions[index]['isSelected'] = false;
    }
    for (let index = 0; index < this.dashboardModel.azureRegions.length; index++) {
      this.dashboardModel.azureRegions[index]['isSelected'] = false;
    }
    for (let index = 0; index < this.dashboardModel.gceRegions.length; index++) {
      this.dashboardModel.gceRegions[index]['isSelected'] = false;
    }

  }

  isRegionsSelected(region: any) {
    for (let index = 0; index < this.speedtestModel.destinationCloudRegions[this.destinationCloudProvider].length; index++) {
      if (region.cloud_info.region === this.speedtestModel.destinationCloudRegions[this.destinationCloudProvider][index]['cloud_info']['region'] && region.public_ip === this.speedtestModel.destinationCloudRegions[this.destinationCloudProvider][index]['public_ip']) {
        this.speedtestModel.destinationCloudRegions[this.destinationCloudProvider].splice(index, 1);
        for (let step = 0; step < this.speedtestModel.destinationRegions.length; step++) {
          if (region.cloud_info.region === this.speedtestModel.destinationRegions[step]['cloud_info']['region'] && region.public_ip === this.speedtestModel.destinationRegions[step]['public_ip']) {
            this.speedtestModel.destinationRegions.splice(step, 1);
            break;
          }
        }
        region.isSelected = false;
        return true;
      }
    }
    return false
  }

  removeRegionFromDestination(region: any, cloudProvider: any) {
    // "dashboardModel.azureRegions"
    for (let index = 0; index < this.speedtestModel.destinationCloudRegions[cloudProvider].length; index++) {
      if (region.cloud_info.region === this.speedtestModel.destinationCloudRegions[cloudProvider][index]['cloud_info']['region'] && region.public_ip == this.speedtestModel.destinationCloudRegions[cloudProvider][index]['public_ip']) {
        this.speedtestModel.destinationCloudRegions[cloudProvider].splice(index, 1);
        for (let step = 0; step < this.speedtestModel.destinationRegions.length; step++) {
          if (region.cloud_info.region === this.speedtestModel.destinationRegions[step]['cloud_info']['region'] && region.public_ip === this.speedtestModel.destinationRegions[step]['public_ip']) {
            this.speedtestModel.destinationRegions.splice(step, 1);
            break;
          }
        }
        if (cloudProvider == 'aws') {
          for (let i = 0; i < this.dashboardModel.awsRegions.length; i++) {
            if (region.cloud_info.region == this.dashboardModel.awsRegions[i]['cloud_info']['region']) {
              this.dashboardModel.awsRegions[i].isSelected = false;
              break;
            }
          }
        } else if (cloudProvider == 'azure') {
          for (let i = 0; i < this.dashboardModel.azureRegions.length; i++) {
            if (region.cloud_info.region == this.dashboardModel.azureRegions[i]['cloud_info']['region']) {
              this.dashboardModel.azureRegions[i].isSelected = false;
              break;
            }
          }
        } else if (cloudProvider == 'gce') {
          for (let i = 0; i < this.dashboardModel.gceRegions.length; i++) {
            if (region.cloud_info.region == this.dashboardModel.gceRegions[i]['cloud_info']['region']) {
              this.dashboardModel.gceRegions[i].isSelected = false;
              break;
            }
          }
        }
        this.generateAmMap();
        break;

      }
    }
  }

  changeRegionState(region: any) {

    if (!this.isRegionsSelected(region)) {
      region.isSelected = true;
      this.speedtestModel.destinationRegions.push(region);
      this.speedtestModel.destinationCloudRegions[this.destinationCloudProvider].push(region);
    }
    this.generateAmMap();

    console.log('regions: ', region);
  }


  getCurrentSourceRegion() {
    for (let index = 0; index < this.dashboardModel.locations[this.speedtestModel.sourceCloudProvider].length; index++) {
      if (this.dashboardModel.locations[this.speedtestModel.sourceCloudProvider][index]['cloud_info']['region'] == this.speedtestModel.sourceCloudRegion) {
        this.currentSourceRegion = this.dashboardModel.locations[this.speedtestModel.sourceCloudProvider][index];
        break;
      }
    }
    console.log('current location: ', this.currentSourceRegion);

  }

  getGeolocation() {
    return this.http.post('https://www.googleapis.com/geolocation/v1/geolocate?key=' + this.properties.GOOGLE_API_KEY, {});
    // return this.http.get("https://freegeoip.net/json/");
  };

  getSeriesData(chartType: any, name: any, data: any) {
    return {
      type: chartType,
      name: name,
      data: data,
      dataLabels: {
        enabled: false
      },
      shadow: {
        width: 3,
        offsetX: 0,
        offsetY: 0,
        opacity: 0.06
      }
    };
  }

  getChartConfig(title: any, unit: any, series: any, chartType: any) {
    const options = {
      chart: {
        type: chartType, zoomType: 'xy',
        style: {
          fontFamily: 'Roboto, sans-serif'
        }
      },
      title: { text: title },
      colors: this.chartColors,
      global: {
        useUTC: false,
      },
      xAxis: {
        type: 'datetime',
        tickInterval: 5000,
        dateTimeLabelFormats: {
          second: '%H:%M:%S'
        },
        startOnTick: true
      },
      yAxis: {
        labels: {
          format: '{value}'
        },
        title: {
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
  getChartData(cloud_region: any, valueKay: any) {
    const metricData: any = [];
    for (let index = 0; index < this.chartModel.chartData.length; index++) {
      const jsonObj = this.chartModel.chartData[index];
      if (jsonObj['destination_region'] != cloud_region) {
        continue;
      }
      // if (jsonObj.value !== null) {
      const date: Date = new Date(jsonObj.time);
      let yVal = jsonObj[valueKay];

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
    this.slimLoadingBarService.start();
    this.isTestCompleted = false;
    this.disabledStart = true;
    let latencySeries = [];
    let badwidthSeries = [];
    this.dashboardService.getLatencyAndBandwidth(this.speedtestModel).subscribe((resp: any) =>{
      let chartData = JSON.parse(resp);
      console.log('chart: ', chartData);
      this.chartModel.chartData = chartData['data'];
      for (let index = 0; index < this.speedtestModel.destinationRegions.length; index++) {
        latencySeries.push(this.getSeriesData('spline', this.speedtestModel.destinationRegions[index].cloud_info.region, this.getChartData(this.speedtestModel.destinationRegions[index].cloud_info.region, 'latency')));
        badwidthSeries.push(this.getSeriesData('spline', this.speedtestModel.destinationRegions[index].cloud_info.region, this.getChartData(this.speedtestModel.destinationRegions[index].cloud_info.region, 'throughput')));
      }
      this.updateLatencyAndBandwidthForDestinationCloud();
      this.latencyOptions = this.getChartConfig('', this.properties.MILISECONDS, latencySeries, 'spline');
      this.bandwidthOptions = this.getChartConfig('', this.properties.MBPS, badwidthSeries, 'spline');
      this.isTestCompleted = true;
      this.disabledStart = false;
      this.slimLoadingBarService.complete();
    }, (error: any) =>{
        console.log('errrrrrrrrr', error);
    });
   
  }

  updateLatencyAndBandwidthForDestinationCloud() {

    for (let key in this.speedtestModel.destinationCloudRegions) {
      for (let index = 0; index < this.speedtestModel.destinationCloudRegions[key].length; index++) {
        let data = this.getAvarageLatencyAndBandwidth(this.speedtestModel.destinationCloudRegions[key][index]);
        if (data.latency != 0.0) {
          this.speedtestModel.destinationCloudRegions[key][index]['latency'] = data.latency;
        }
        if (data.bandwidth != 0.0) {
          this.speedtestModel.destinationCloudRegions[key][index]['bandwidth'] = data.bandwidth;
        }
      }
    }

  }

  setDataPoint(data, obj) {
    for (var index = 0; index < 6; index++) {
      if (index == 0) {
        data.push({ 'time': new Date(), 'value': null });
      } else {
        let date = new Date()
        date.setSeconds(obj.pingStartTime.getSeconds() + (index * 5));
        data.push({ 'time': date, 'value': null });
      }
    }
  }

  /**
   * [getTimeDiff description]
   */
  getTimeDiff() {
    let endTime: any = new Date();
    let diff: any = endTime - this.pingStartTime;

    var diffMins = Math.round(((diff % 86400000) % 3600000) / 60000);
    return diffMins;
  }


  /**
   * [getTimeDiffInSeconds description]
   */
  getTimeDiffInSeconds(pingStartTime, index) {
    let endTime: any = new Date();
    let diff: any = endTime.getTime() - pingStartTime.getTime();

    var diffSec = diff / 1000;
    return diffSec;
  }


  getInvetory() {

    for (let key in this.dashboardModel.inventoryPath) {
      let path = this.dashboardModel.inventoryPath[key]
      this.locations[key] = [];
      this.dashboardService.getInventory(path).subscribe((inventory: any) => {
        let data = JSON.parse(inventory);
        for (let index = 0; index < data.data.length; index++) {
          let obj = data.data[index];
          obj.label = obj.region_name;
          obj.isOpen = false;
          obj.iconUrl = this.getCloudPinPath(key);
          obj.color = this.chartColors[index];
          obj.isSelected = false;
          this.dashboardModel.locations[key].push(obj);
        }
        // let totalRegions = this.locations.length * 12;
        // this.progressFactor = 100/totalRegions;
        // this.generateAmMap();
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
    this.isTestCompleted = true;
  }

  getAvarageLatencyAndBandwidth(object: any) {
    let data = {
      "latency": 0.0,
      "bandwidth": 0.0
    }
    let latency = 0.0;
    let bandwidth = 0.0;
    let countSeries = 0;
    for (let index = 0; index < this.chartModel.chartData.length; index++) {
      if (this.chartModel.chartData[index]['destination_region'] == object.cloud_info.region) {
        countSeries++;
        latency += this.chartModel.chartData[index]['latency'];
        bandwidth += this.chartModel.chartData[index]['throughput'];
      }
    }

    if (countSeries != 0) {
      data.latency = parseFloat((latency / countSeries).toFixed(2));
      data.bandwidth = parseFloat((bandwidth / countSeries).toFixed(2));
    }
    return data;
  }

  updateMarkerLabel(marker) {
    let data = this.getAvarageLatencyAndBandwidth(marker);

    let content = "";
    if (data.latency == 0.0 && data.bandwidth == 0.0) {
      content = "<strong>" + marker.region_name + "</strong>";
    } else {
      content = '<table class="table table-bordered" width="100%">' +
        '<thead>' +
        '<tr> <th style="text-align: center; border-top: none" colspan="2">' + marker.region_name + '</th></tr>' +
        '<tr> <th style="text-align: center">' + "Latency <br> (msec)" + '</th> <th style="text-align: center">' + 'Throughput <br> (mbps)' + '</th></tr>' +
        '</thead>' +
        '<tbody>' +
        '<tr><td style="text-align: center;">' + (data.latency == 0.0 ? this.properties.NA_TEXT : data.latency) + '</td> <td style="text-align: center;">' + (data.bandwidth == 0.0 ? this.properties.NA_TEXT : data.bandwidth) + '</td></tr>' +
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
      return obj.latency;
    } else if (obj.dashboardModel && obj.dashboardModel.latency
      && obj.dashboardModel.latency.length > 0 && obj.currentLatencyIndex > 0) {
      return obj.dashboardModel.latency[obj.currentLatencyIndex - 1].value;
    }

    return this.properties.CALCULATING_TEXT;
  }

  readLatestThroughput(obj) {
    if (obj.bandwidthCompleted && obj.bandwidth) {
      return obj.bandwidth;
    } else if (obj.dashboardModel && obj.dashboardModel.bandwidth
      && obj.dashboardModel.bandwidth.length > 0 && obj.currentBandwidthIndex > 0) {
      return obj.dashboardModel.bandwidth[obj.currentBandwidthIndex - 1].value;
    }

    return this.properties.CALCULATING_TEXT;
  }

  sortBy(property) {
    this.sortableColumn = property;
    this.isDesc = !this.isDesc; //change the direction    
    let direction = this.isDesc ? 1 : -1;

    this.locations.sort(function(a, b) {
      let aProp = null;
      let bProp = null;
      if (property != 'region_name') {
        aProp = parseFloat(a[property]);
        bProp = parseFloat(b[property]);
      } else {
        aProp = a[property];
        bProp = b[property];
      }

      if (aProp < bProp) {
        return -1 * direction;
      }
      else if (aProp > bProp) {
        return 1 * direction;
      }
      else {
        return 0;
      }
    });
  }

  updateChartOnMarker(marker: any, hide: boolean) {
    if (this.latencyChart && this.latencyChart.series) {
      for (let index = 0; index < this.latencyChart.series.length; index++) {
        if (this.latencyChart.series[index].name !== marker.cloud_info.region && hide) {
          this.latencyChart.series[index].setVisible(false, false);

          if (this.bandwidthChart && this.bandwidthChart.series) {
            this.bandwidthChart.series[index].setVisible(false, false);
          }
        } else {
          this.latencyChart.series[index].setVisible(true, false);
          this.bandwidthChart.series[index].setVisible(true, false);
          if (hide) {
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

  generateAmMap() {
    let self = this;

    var lines = [];
    var images = [];

    if (self.currentSourceRegion && self.currentSourceRegion.lat && self.currentSourceRegion.lng) {
      var userImg = {
        "id": "source_location",
        "imageURL": self.currentSourceRegion.iconUrl,
        "width": 22,
        "height": 39,
        "title": function() {
          return self.currentSourceRegion.lat ? '<b>Source Cloud Region</b><br>' + self.currentSourceRegion.label : "NA";
        },

        "latitude": self.currentSourceRegion.lat,
        "longitude": self.currentSourceRegion.lng,
        "scale": 1
      }

      images.push(userImg);
    }

    for (let index = 0; index < this.speedtestModel.destinationRegions.length; index++) {
      let object = this.speedtestModel.destinationRegions[index];

      if (self.currentSourceRegion.lat && self.currentSourceRegion.lng) {
        // Creating lines
        var line = {
          "id": "line" + index,
          "latitudes": [self.currentSourceRegion.lat, object.lat],
          "longitudes": [self.currentSourceRegion.lng, object.lng],
          "color": object.color,
          "arc": -0.85,
          "thickness": 2
        };

        lines.push(line);
      }

      var regionImg = {
        "id": object.cloud_info.region,
        "imageURL": object.iconUrl,
        "width": 22,
        "height": 39,
        "title": function() {
          if (!self.hoveredObject || self.hoveredObject.id != object.cloud_info.region) {
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



    var map = AmCharts.makeChart("map", {
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

    });

    map.balloon.textAlign = 'left';

    map.addListener("rollOverMapObject", function(event) {
      if (event && event.mapObject) {
        if (event.mapObject.objectType == "MapImage") {
          let region = self.getRegionForImage(event.mapObject.id);
          if (region) {
            self.updateChartOnMarker(region, true);
          }
        }
      }
    });

    map.addListener("rollOutMapObject", function(event) {
      if (event && event.mapObject) {
        if (event.mapObject.objectType == "MapImage") {
          let region = self.getRegionForImage(event.mapObject.id);
          if (region) {
            self.updateChartOnMarker(region, false);
          }
        }
      }
    });
  }

  getRegionForImage(regionId) {
    for (let index = 0; index < this.speedtestModel.destinationRegions.length; index++) {
      let location = this.speedtestModel.destinationRegions[index];
      if (location.cloud_info.region === regionId) {
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


