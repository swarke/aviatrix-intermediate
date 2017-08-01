// Import components
import { Component, OnInit, AfterViewInit, ViewEncapsulation, Input } from '@angular/core';
import { ChartModule } from 'angular2-highcharts';
import { DashboardModel, SpeedtestModel, ChartModel } from '../../models';
import { Response, Http } from '@angular/http';
import { DashboardService, PropertiesService } from '../../services';
import { MdDialog, MdDialogRef, MdDialogConfig } from '@angular/material';
import { SlimLoadingBarService } from 'ng2-slim-loading-bar';

declare const google: any;

declare const AmCharts: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  viewProviders: [DashboardService],
  encapsulation: ViewEncapsulation.None
})

// Dashboard component
export class DashboardComponent implements OnInit, AfterViewInit {
  sourceTab: boolean;
  destinationTab: boolean;
  testTab: boolean;
  latencyOptions: any;
  isTestCompleted: boolean;
  bandwidthOptions: any;
  locations: any;
  currentTabIndex: any;
  sourceCloudRegion: any;
  sourceCloudRegions: any[];
  destinationRegions: any[];
  selectedTabIndex: any;
  currentSourceRegion: any;
  latencyChart: any;
  disabledStart: any;
  bandwidthChart: any;
  sourceCloudProvider: any;
  destinationCloudProvider: any;
  mapStyles: any;
  isDesc: boolean;
  sortableColumn: any;
  leftPanelHeader: any;
  inventoryPath: any;
  cloudPinPath: any;
  chartColors: any;
  chartLoaded: any;
  selectedAllAWSRegion: boolean;
  selectedAllAzureRegion: boolean;
  selectedAllGCERegion: boolean;

  dashboardModel: DashboardModel;
  speedtestModel: SpeedtestModel;
  chartModel: ChartModel;

  public zoom = 15;
  public opacity = 1.0;
  public width = 5;
  text = '';
  hoveredObject = null;

  /**
   * Contructor for dashboard component
   */
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

    this.disabledStart = false;
    this.isDesc = false;
    this.sortableColumn = "";
    this.latencyOptions = null;
    this.bandwidthOptions = null;
    this.latencyChart = null;
    this.bandwidthChart = null;
    this.dashboardModel = new DashboardModel();
    this.speedtestModel = new SpeedtestModel();
    this.chartModel = new ChartModel();
    this.locations = [];
    this.isTestCompleted = false;
    this.sourceTab = true;
    this.destinationTab = false;
    this.testTab = false;
    this.currentTabIndex = 0;
    this.selectedTabIndex = 0;
    this.sourceCloudRegion = "";
    this.sourceCloudProvider = "";
    this.destinationCloudProvider = "azure";
    this.chartLoaded = false;
    this.speedtestModel.timestamp = this.dashboardModel.timeRanges[0].value;
    this.selectedAllAWSRegion = false;
    this.selectedAllAzureRegion = false;
    this.selectedAllGCERegion = false;
    this.generateAmMap();
  }

  /**
   * set destination cloud provider for destination tab to show regions
   * [setDestinationCloudProvider description]
   * @param {[any]} cloud [cloud provider]
   */
  setDestinationCloudProvider(cloud: any) {
    this.destinationCloudProvider = cloud;
  }

  /**
   * Change tab on click
   * [changeTab description]
   * 
   * @param {[any]} tabIndex [tab index]
   */
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
      this.startTest();
      this.sourceTab = false;
      this.destinationTab = false;
      this.testTab = true;
      this.currentTabIndex = 2;
    }
    // this.isTestCompleted = true;
    // this.disabledStart = false;
  }

  /**
   * Validate source tab and destination validation
   */
  validate() {
    if (this.currentTabIndex == 0) {
      return this.validationSourceTab();
    } else if (this.currentTabIndex == 1) {
      return this.validationDestnationTab();
    } else {
      return true;
    }
  }

  /**
   * if source cloud provider and region not selected then return false
   */
  validationSourceTab() {
    if (this.speedtestModel.sourceCloudProvider && this.speedtestModel.sourceCloudRegion) {
      return true;
    }
    return false;
  }

  /**
   * if no destination cloud region then return false
   */
  validationDestnationTab() {
    if (this.speedtestModel.destinationRegions.length) {
      return true;
    }
    this.selectedTabIndex = 1;
    return false;
  }

  /**
   * Back on previous tab on click
   */
  backTab() {
    if (this.destinationTab) {
      this.changeTab(0);
    } else if (this.testTab) {
      this.changeTab(1);
    }
  }

  /**
   * Next tab on click
   */
  nextTab() {
      if (this.sourceTab) {
      this.changeTab(1);
      } else if (this.destinationTab) {
        this.changeTab(2);
      }
  }

  /**
   * Change tab on click
   * [changeMenuTab description] 
   * @param {[any]} tabIndex [Tab index]
   */
  changeMenuTab(tabIndex: any) {
    if(tabIndex < this.currentTabIndex) {
      this.changeTab(tabIndex);
    } else {
      if((tabIndex == 1 && this.validationSourceTab()) || (tabIndex == 2 && this.validationSourceTab() && this.validationDestnationTab())){
          if(this.currentTabIndex != tabIndex) {
            this.changeTab(tabIndex);
          }
      } 
    }
  }

  /**
   * Latency chart Instance
   * [latencyInstance description] 
   * @param {[type]} chartInstance [instance of Latency Highchart]
   */
  latencyInstance(chartInstance) {
    this.latencyChart = chartInstance;
  }

  
  /**
   * throughput chart Instance
   * [bandwidthInstance description] 
   * @param {[type]} chartInstance [instance of throughput Highchart]
   */
  bandwidthInstance(chartInstance) {
    this.bandwidthChart = chartInstance;
  }

  ngOnInit() {
  }

  /**
   * After initialized view then get the inventory and set aws, azure and gce regions
   */
  ngAfterViewInit() {
    let self = this;
    self.getInvetory();
    self.dashboardModel.awsRegions = self.dashboardModel.locations.aws;
    self.dashboardModel.azureRegions = self.dashboardModel.locations.azure;
    self.dashboardModel.gceRegions = self.dashboardModel.locations.gce;
  }

  /**
   * Change source colud provider
   */
  changeSourceCloudProvider() {
    this.sourceCloudRegions = this.dashboardModel.locations[this.speedtestModel.sourceCloudProvider]
    this.speedtestModel.sourceCloudRegion = "";
    // this.selectedAllAWSRegion = false;
    // this.selectedAllAzureRegion = false;
    // this.selectedAllGCERegion = false;
    this.isTestCompleted = false;
    // if(this.chartLoaded) {
    //   this.latencyChart.destroy();
    // this.bandwidthChart.destroy();
    // this.chartLoaded = false;
    // }
    // this.chartModel.clearModel();
    // this.getCurrentSourceRegion();
    this.currentSourceRegion = null;
    // this.clearGraphAndChart();
    this.generateAmMap();
  }
  
  /**
   * Update checkbox is selected or deselected and remove region from destination regions
   * [updateCheckbox description]
   * @param {[any]} region [Cloud region object]
   */
  updateCheckbox(region: any) {
    this.isTestCompleted = false;
    region.latency = 0.0;
    region.bandwidth = 0.0;
    region.isSelected = !region.isSelected;
    if (!this.isRegionsSelected(region)) {
      region.isSelected = true;
      this.speedtestModel.destinationRegions.push(region);
      this.speedtestModel.destinationCloudRegions[this.destinationCloudProvider].push(region);
      this.getMarkSelectAllRegion(this.destinationCloudProvider);
    } else {
      this.cleanLatencyFromChartModel(region.cloud_info.region);
      if(this.destinationCloudProvider == "aws") {
        this.selectedAllAWSRegion = false;
      } else if(this.destinationCloudProvider == "azure") {
        this.selectedAllAzureRegion = false;
      } else if(this.destinationCloudProvider == "gce") {
        this.selectedAllGCERegion = false;
      }
    }
    
    this.generateAmMap();
  }

  getMarkSelectAllRegion(destinationCloudProvider: any) {
    if(destinationCloudProvider == 'azure') {
      let selectAll = true;
      for(let index = 0; index < this.dashboardModel.azureRegions.length; index++) {
        if(!this.dashboardModel.azureRegions[index].isSelected && this.dashboardModel.azureRegions[index].cloud_info.region != this.speedtestModel.sourceCloudRegion) {
          selectAll = false;
          break;
        }
      }
      if(selectAll) {
        this.selectedAllAzureRegion = true;
      }
    }else if(destinationCloudProvider == 'aws') {
      let selectAll = true;
      for(let index = 0; index < this.dashboardModel.awsRegions.length; index++) {
        if(!this.dashboardModel.awsRegions[index].isSelected && this.dashboardModel.awsRegions[index].cloud_info.region != this.speedtestModel.sourceCloudRegion) {
          selectAll = false;
          break;
        }
      }
      if(selectAll) {
        this.selectedAllAWSRegion = true;
      }
    } else if(destinationCloudProvider == 'gce') {
      let selectAll = true;
      for(let index = 0; index < this.dashboardModel.gceRegions.length; index++) {
        if(!this.dashboardModel.gceRegions[index].isSelected && this.dashboardModel.gceRegions[index].cloud_info.region != this.speedtestModel.sourceCloudRegion) {
          selectAll = false;
          break;
        }
      }
      if(selectAll) {
        this.selectedAllGCERegion = true;
      }
    }
  }

  removeAllCloudRegions(cloudProvider: any, isSelected: boolean) {
    let regions = [];
    for(let index = 0; index < this.speedtestModel.destinationRegions.length; index++) {
      if(this.speedtestModel.destinationRegions[index].cloudProvider != cloudProvider) {
        regions.push(this.speedtestModel.destinationRegions[index]);
      } else {
        this.cleanLatencyFromChartModel(this.speedtestModel.destinationRegions[index].cloud_info.region);
      }
    }
    this.speedtestModel.destinationRegions = regions;
  }

  selectAndDeselectAllCloudRegions(cloudProvider: any) {
    this.isTestCompleted = false;
    let cloud = "";
    let cloudProviderKey = "";
    let isSelected = false;
    if(cloudProvider == 'azure') {
      cloudProviderKey = "azureRegions";
      this.selectedAllAzureRegion = !this.selectedAllAzureRegion;
      isSelected = this.selectedAllAzureRegion;
    } else if(cloudProvider == 'aws') {
      cloudProviderKey = "awsRegions";
      this.selectedAllAWSRegion = !this.selectedAllAWSRegion;
      isSelected = this.selectedAllAWSRegion;
    } else if(cloudProvider == 'gce') {
      cloudProviderKey = "gceRegions";
      this.selectedAllGCERegion = !this.selectedAllGCERegion;
      isSelected = this.selectedAllGCERegion;
    }
    this.speedtestModel.destinationCloudRegions[cloudProvider] = [];
    this.removeAllCloudRegions(cloudProvider, isSelected);
    if(isSelected) {
      for(let index = 0; index < this.dashboardModel[cloudProviderKey].length; index++) {
        if(this.speedtestModel.sourceCloudProvider == cloudProvider && 
          this.dashboardModel[cloudProviderKey][index].cloud_info.region == this.speedtestModel.sourceCloudRegion) {
           continue;
        }
        this.speedtestModel.destinationRegions.push(this.dashboardModel[cloudProviderKey][index])
          this.speedtestModel.destinationCloudRegions[cloudProvider].push(this.dashboardModel[cloudProviderKey][index])
          this.dashboardModel[cloudProviderKey][index].isSelected = true;
        
      }
    } else {
      for(let index = 0; index < this.dashboardModel[cloudProviderKey].length; index++) {
        this.dashboardModel[cloudProviderKey][index].isSelected = false;
      }
    }
    this.generateAmMap();
    if(!isSelected && this.latencyChart.series.length > 0) {
      this.startTest();
    }
  }



  deselectAllCloudRegions(cloudProvider: any) {
    let cloud = "";
    if(cloudProvider == 'azure') {
      cloud = "azureRegions";
      this.speedtestModel.destinationRegions = [];
      this.speedtestModel.clearDestinationCloudRegions();
    } else if(cloudProvider == 'aws') {
      cloud = "awsRegions";
      this.speedtestModel.destinationRegions = [];
      this.speedtestModel.clearDestinationCloudRegions();
    } else if(cloudProvider == 'gce') {
      cloud = "gceRegions";
      this.speedtestModel.destinationRegions = [];
      this.speedtestModel.clearDestinationCloudRegions();
    }
    for(let index = 0; index < this.dashboardModel[cloud].length; index++) {
      this.speedtestModel.destinationRegions.push(this.dashboardModel[cloud][index])
      this.speedtestModel.destinationCloudRegions[cloudProvider].push(this.dashboardModel[this.destinationCloudProvider][index])
      this.dashboardModel[cloud][index].isSelected = true;
    }
    this.generateAmMap();
  }

  /**
   * Change source region then remove all destination region list
   */
  changeSourceRegion() {
    // this.selectedAllAWSRegion = false;
    // this.selectedAllAzureRegion = false;
    // this.selectedAllGCERegion = false;
    this.isTestCompleted = false;
        // if(this.chartLoaded) {
    //   this.latencyChart.destroy();
    // this.bandwidthChart.destroy();
    // this.chartLoaded = false;
    // }
    // this.chartModel.clearModel();
    this.getCurrentSourceRegion();
    this.removeRegionFromDestination(this.currentSourceRegion, this.speedtestModel.sourceCloudProvider);
    this.getMarkSelectAllRegion('aws');
    this.getMarkSelectAllRegion('azure');
    this.getMarkSelectAllRegion('gce');

    // this.clearGraphAndChart();
    this.generateAmMap();
  }

  /**
   * Start test again on changing timestamp
   */
  changeTimestamp() {
    if(this.testTab && this.chartLoaded) {
      this.startTest();
    }
  }

  /**
   * clear destination region list and clear map
   */
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

  /**
   * return true if region is selected else false
   * [isRegionsSelected description]
   * @param {[any]} region [Cloud provider region object]
   */
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
        for (let i = 0; this.chartLoaded && i < this.latencyChart.series.length ; i++) {
          if(this.latencyChart.series.length == 1) {
            this.latencyChart.destroy();
            this.bandwidthChart.destroy();
            this.chartLoaded = false;
            break;
          } 
          if(this.latencyChart.series[i].name == region.cloud_info.region) {
            this.latencyChart.series[i].remove()
            this.bandwidthChart.series[i].remove();
            break;
          }
        }
        region.isSelected = false;
        return true;
      }
    }
    return false
  }

  cleanLatencyFromChartModel(destination_region: any) {
    for (let index = 0; index < this.chartModel.chartData.length; index++) {
      if (this.chartModel.chartData[index]['destination_region'] == destination_region) {
        this.chartModel.chartData[index]['latency'] = 0.0;
        this.chartModel.chartData[index]['throughput'] = 0.0;
      }
    }
  }
  /**
   * remove region from destination region list
   * [removeRegionFromDestination description]
   * @param {[any]} region [cloud provider region object]
   * @param {[any]} cloudProvider [cloud provider]
   */
  removeRegionFromDestination(region: any, cloudProvider: any) {
    // "dashboardModel.azureRegions"
    for (let index = 0; index < this.speedtestModel.destinationCloudRegions[cloudProvider].length; index++) {
      if (region.cloud_info.region === this.speedtestModel.destinationCloudRegions[cloudProvider][index]['cloud_info']['region'] && region.public_ip == this.speedtestModel.destinationCloudRegions[cloudProvider][index]['public_ip']) {
        this.speedtestModel.destinationCloudRegions[cloudProvider][index].latency = 0.0;
        this.speedtestModel.destinationCloudRegions[cloudProvider][index].bandwidth = 0.0;
        this.speedtestModel.destinationCloudRegions[cloudProvider].splice(index, 1);
        for (let step = 0; step < this.speedtestModel.destinationRegions.length; step++) {
          if (region.cloud_info.region === this.speedtestModel.destinationRegions[step]['cloud_info']['region'] && region.public_ip === this.speedtestModel.destinationRegions[step]['public_ip']) {
            this.speedtestModel.destinationRegions.splice(step, 1);
            this.cleanLatencyFromChartModel(region.cloud_info.region);
            break;
          }
        }
        if (cloudProvider == 'aws') {
          for (let i = 0; i < this.dashboardModel.awsRegions.length; i++) {
            if (region.cloud_info.region == this.dashboardModel.awsRegions[i]['cloud_info']['region']) {
              this.dashboardModel.awsRegions[i].isSelected = false;
              this.selectedAllAWSRegion = false;
              break;
            }
          }
        } else if (cloudProvider == 'azure') {
          for (let i = 0; i < this.dashboardModel.azureRegions.length; i++) {
            if (region.cloud_info.region == this.dashboardModel.azureRegions[i]['cloud_info']['region']) {
              this.dashboardModel.azureRegions[i].isSelected = false;
              this.selectedAllAzureRegion = false;
              break;
            }
          }
        } else if (cloudProvider == 'gce') {
          for (let i = 0; i < this.dashboardModel.gceRegions.length; i++) {
            if (region.cloud_info.region == this.dashboardModel.gceRegions[i]['cloud_info']['region']) {
              this.dashboardModel.gceRegions[i].isSelected = false;
              this.selectedAllGCERegion = false;
              break;
            }
          }
        }
        
        for (let i = 0; this.chartLoaded && i < this.latencyChart.series.length ; i++) {
          if(this.latencyChart.series.length == 1) {
            this.latencyChart.destroy();
            this.bandwidthChart.destroy();
            this.chartLoaded = false;
            break;
          } 
          if(this.latencyChart.series[i].name == region.cloud_info.region) {
            this.latencyChart.series[i].remove()
            this.bandwidthChart.series[i].remove();
            break;
          }
        }
        this.generateAmMap();
        this.isTestCompleted = false;
        break;
      }
    }


  }

  /**
   * Change region state if it select or deselect
   * [changeRegionState description]
   * @param {[any]} region [Cloud provider region]
   */
  changeRegionState(region: any) {

    if (!this.isRegionsSelected(region)) {
      region.isSelected = true;
      this.speedtestModel.destinationRegions.push(region);
      this.speedtestModel.destinationCloudRegions[this.destinationCloudProvider].push(region);
    }
    this.generateAmMap();

    console.log('regions: ', region);
  }

  /**
   * Get current source regions list as per source cloud provider
   */
  getCurrentSourceRegion() {
    for (let index = 0; index < this.dashboardModel.locations[this.speedtestModel.sourceCloudProvider].length; index++) {
      if (this.dashboardModel.locations[this.speedtestModel.sourceCloudProvider][index]['cloud_info']['region'] == this.speedtestModel.sourceCloudRegion) {
        this.currentSourceRegion = this.dashboardModel.locations[this.speedtestModel.sourceCloudProvider][index];
        break;
      }
    }
    console.log('current location: ', this.currentSourceRegion);

  }

  /**
   * get series data as (latency and throughput)
   * [getSeriesData description]
   * @param {[any]} chartType [Type of chart]
   * @param {[any]} name [name of series]
   * @param {[any]} data [List of data(latency and throughput)]
   * @param {[any]} color [set the color for series]
   */
  getSeriesData(chartType: any, name: any, data: any, color: any) {
    return {
      type: chartType,
      name: name,
      data: data,
      color: color,
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

  /**
   * Get chart config with all details for hogh chart as color, series data
   * [getSeriesData description]
   * @param {[any]} title [title for chart]
   * @param {[any]} unit [unit for chart]
   * @param {[any]} series [series for chart]
   * @param {[any]} chartType [type of chart]
   */
  getChartConfig(title: any, unit: any, series: any, chartType: any) {
    let self = this;
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
        tickInterval:  0,
        title: {
          text: 'Time'
        },
        startOnTick: true,
      },
      yAxis: {
        labels: {
          format: '{value}'
        },
        title: {
          text: unit
        },
      },
      series: series,
      responsive: {
        rules: [{
            condition: {
                maxWidth: 500
            },
            chartOptions: {
                legend: {
                    align: 'center',
                    verticalAlign: 'bottom',
                    layout: 'horizontal'
                },
                yAxis: {
                    labels: {
                        align: 'left',
                        x: 0,
                        y: -5
                    },
                    title: {
                        text: null
                    }
                },
                subtitle: {
                    text: null
                },
                credits: {
                    enabled: false
                }
            }
        }]
    }
    };

     if (this.speedtestModel.timestamp == '7d' || this.speedtestModel.timestamp == '15d'
                   || this.speedtestModel.timestamp == '30d') {
       options.xAxis['labels'] = this.getLabelFormatter();
       options.xAxis['title']['text'] = 'Day';
       options.xAxis['tickInterval'] = 3600 * 1000 *24;

     } else {
       options.xAxis['dateTimeLabelFormats'] = this.getLabelFormatter();
       options.xAxis['title']['text'] = 'Time';
       options.xAxis['tickInterval'] = 3600 * 1000 *2;
     }

    return options;
  }

  /**
   * Get the label formatter for x axis on date
   * [getLabelFormatter description]
   */
  getLabelFormatter() {
    let label = null;
    let self = this;
    if (this.speedtestModel.timestamp == '7d' || this.speedtestModel.timestamp == '15d'
                   || this.speedtestModel.timestamp == '30d') {
      label = {
            formatter: function() {
                if(self.speedtestModel.timestamp == '7d' || self.speedtestModel.timestamp == '15d'
                   || self.speedtestModel.timestamp == '30d') {
                  var date = new Date(this.value);
                  var month = date.toDateString().substring(4,7);
                  var day = date.getDate();
                  return  day + '. ' + month;
                } else {
                  var date = new Date(this.value);
                  return  date.getUTCHours()+ ':' + date.getUTCSeconds();
                }
            }
      } 
    } else {
      label = {
         second: '%H:%M:%S'
    }
   }
  }

  /**
   * Get the all data for specific destination cloud region
   * [getChartData description]
   * @param {[any]} cloud_region [name cloud region]
   * @param {[any]} valueKay [value key]
   */
  getChartData(cloud_region: any, valueKay: any) {
    const metricData: any = [];
    for (let index = 0; index < this.chartModel.chartData.length; index++) {
      const jsonObj = this.chartModel.chartData[index];
      if (jsonObj['destination_region'] != cloud_region) {
        continue;
      }
      const date: Date = new Date(jsonObj.time);
      let yVal = parseFloat((jsonObj[valueKay]).toFixed(2));
      if(this.speedtestModel.timestamp == '7d' || this.speedtestModel.timestamp == '15d' || 
        this.speedtestModel.timestamp == '30d') {
        metricData.push([Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(),
        0, 0, 0), yVal]);

      } else {
        metricData.push([Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(),
        date.getHours(), date.getMinutes(), date.getSeconds()), yVal]);
      }
    }

    return metricData;
  }

  /**
   * get the tool tip data on chart hover
   * [getChartPoint description]
   * @param {[type]} date  [date on chart point]
   * @param {[type]} value [value on chart]
   */
  getChartPoint(date, value) {
    return [Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(),
      date.getHours(), date.getMinutes(), date.getSeconds()), value];
  }

  /**
   * Starts test for calculating the statistics.
   */
  startTest() {
    // Start Loader
    // if (this.isTestCompleted) {
    //   return;
    // }
    if(this.speedtestModel.destinationRegions.length < 1) {
      this.latencyChart.destroy();
      this.bandwidthChart.destroy();
      this.chartLoaded = false;
      return;
    }
    this.properties.isLoading = true;
    // this.isTestCompleted = false;
    // this.disabledStart = true;
    let latencySeries = [];
    let badwidthSeries = [];
    this.dashboardService.getLatencyAndBandwidth(this.speedtestModel).subscribe((resp: any) =>{
      let chartData = JSON.parse(resp);
      console.log('chart: ', chartData);
      this.chartModel.chartData = chartData['data'];
      for (let index = 0; index < this.speedtestModel.destinationRegions.length; index++) {
        latencySeries.push(this.getSeriesData('spline', this.speedtestModel.destinationRegions[index].cloud_info.region, this.getChartData(this.speedtestModel.destinationRegions[index].cloud_info.region, 'latency'), this.speedtestModel.destinationRegions[index].color));
        badwidthSeries.push(this.getSeriesData('spline', this.speedtestModel.destinationRegions[index].cloud_info.region, this.getChartData(this.speedtestModel.destinationRegions[index].cloud_info.region, 'throughput'), this.speedtestModel.destinationRegions[index].color));
      }
      this.updateLatencyAndBandwidthForDestinationCloud();
      this.latencyOptions = this.getChartConfig('', this.properties.MILISECONDS, latencySeries, 'spline');
      this.bandwidthOptions = this.getChartConfig('', this.properties.MBPS, badwidthSeries, 'spline');
      this.isTestCompleted = true;
      // this.disabledStart = false;
      this.chartLoaded = true;
      // Stop Loader
      this.properties.isLoading = false;
    }, (error: any) =>{
      // Stop Loader
        this.properties.isLoading = false;
    });
   
  }

  /**
   * Update latency and throughput for right panel statitics
   */
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

  /**
   * Get the inventory from s3
   */
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
          obj.iconUrl = this.getDestinationCloudPinPath(key);
          obj.logoUrl = this.getDestinationCloudLogoPath(key);
          obj.color = this.chartColors[index];
          obj.isSelected = false;
          obj.cloudProvider = key;
          this.dashboardModel.locations[key].push(obj);
        }
      },
        (error: any) => this.handleError(error)
      );
    }
  }

  handleError(error: any) {

  }

  /**
   * Get destination cloud pin path
   * [getDestinationCloudPinPath description]
   * @param {[any]} key [cloud provider]
   */
  getDestinationCloudPinPath(key: any) {
    if (key == "aws") {
      return this.properties.AWS_DESTINATION_CLOUD_PIN_PATH;
    } else if (key == "azure") {
      return this.properties.AZURE_DESTINATION_CLOUD_PIN_PATH;
    } else if (key == "gce") {
      return this.properties.GCE_DESTINATION_CLOUD_PIN_PATH;
    }
  }

  getDestinationCloudLogoPath(key: any) {
    if (key == "aws") {
      return this.properties.AWS_DESTINATION_CLOUD_LOGO_PATH;
    } else if (key == "azure") {
      return this.properties.AZURE_DESTINATION_CLOUD_LOGO_PATH;
    } else if (key == "gce") {
      return this.properties.GCE_DESTINATION_CLOUD_LOGO_PATH;
    }
  }

  

  /**
   * Get Source cloud pin path
   */
  getSourceCloudPinPath() {
    if (this.speedtestModel.sourceCloudProvider == "aws") {
      return this.properties.AWS_SOURCE_CLOUD_PIN_PATH;
    } else if (this.speedtestModel.sourceCloudProvider == "azure") {
      return this.properties.AZURE_SOURCE_CLOUD_PIN_PATH;
    } else if (this.speedtestModel.sourceCloudProvider == "gce") {
      return this.properties.GCE_SOURCE_CLOUD_PIN_PATH;
    }
  }

  /**
   * Get the average latency and throughput for right panel statitics
   * [getAvarageLatencyAndBandwidth description]
   * @param {[any]} object [cloud provider object]
   */
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

  /**
   * Update marker on region pin
   * [updateMarkerLabel description]
   * @param {[[type]]} marker [event on chart and object]
   */
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
   * Sorting list
   * [sortBy description]
   * @param {[type]} property [type of property]
   */
  sortBy(property) {
    this.sortableColumn = property;
    this.isDesc = !this.isDesc; //change the direction    
    let direction = this.isDesc ? 1 : -1;

    for(let provider in this.speedtestModel.destinationRegions) {
      this.speedtestModel.destinationRegions.sort(function(a, b) {
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
  }

  /**
   * Update chart on marker region pin
   * [updateChartOnMarker description]
   * @param {[any]} marker [event on chart]
   * @param {[boolean]} hide [value for hide]
   */
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

  /**
   * Generate amMap for source region, destination regions and link between 
   * source region to destination regions
   */
  generateAmMap() {
    let self = this;

    var lines = [];
    var images = [];

    if (self.currentSourceRegion && self.currentSourceRegion.lat && self.currentSourceRegion.lng) {
      var userImg = {
        "id": "source_location",
        "imageURL": self.getSourceCloudPinPath(),
        "width": 24,
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

  /**
   * Get the image for region
   * [getRegionForImage description]
   * @param {[type]} regionId [region name]
   */
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


