import { Injectable, Inject } from '@angular/core';


@Injectable()
/**
 * @brief      Class for activities service.
 */
export class PropertiesService {

  // TOOL
  public AWS:string = 'AWS';
  public AZURE:string = 'AZURE'; 
  public GCE:string = 'GCE'; 
  // Header
  public TOOL_TAG:string = 'Reinventing Networking...for the Cloud';
  public AWS_TOOL_NAME: string = 'AWS Cloud Speed Test';
  public AZURE_TOOL_NAME: string = 'AZURE Cloud Speed Test';
  public GCE_TOOL_NAME: string = 'GCE Cloud Speed Test';
  public LINK_FEEDBACK: string = 'Feedback';

  public READY_TO_IMPLEMENT: string ='Ready to implement hybrid cloud?';
  public DOWNLOAD_AVIATRIX: string = 'Download Aviatrix<br>Software<br>FREE TRIAL';

  public LEFT_PANEL_AWS_REGION: string  = 'AWS REGIONS';
  public LEFT_PANEL_AZURE_REGION: string  = 'AZURE REGIONS';
  public LEFT_PANEL_GCE_REGION: string  = 'GCE REGIONS';

  // Dashboard
  public RIGHT_PANEL_HEADER: string = 'Cloud To Cloud Network Connectivity';
  public RIGHT_PANEL_REGION_COLUMN_HEADER = 'Region';
  public RIGHT_PANEL_LATENCY_COLUMN_HEADER = 'Latency(msec)';
  public RIGHT_PANEL_THROUGHPUT_COLUMN_HEADER = 'Throughput(mbps)';

  public LATENCY_CHART_HEADER: string = 'LATENCY';
  public THROUGHPUT_CHART_HEADER: string = 'THROUGHPUT';

  public LATENCY_CHART_DATA_NOT_AVAILABLE = 'Latency data is not available.';
  public THROUGHPUT_CHART_DATA_NOT_AVAILABLE = 'Throughput data is not available.';

  public CLICK_START_TO_RUN: string = 'Click Start to run.';

  public NA_TEXT: string = 'N/A';
  public MS:string = 'ms';
  public MILISECONDS = 'miliseconds';
  public MBPS: string = 'mbps';

  public CALCULATING_TEXT = 'Calculating';

  public START: string = 'Begin Speed Test';
  public STOP: string = 'Stop Speed Test';

  public NA_LATITUDE: number = 46.0730555556;
  public NA_LONGITUDE: number = -100.546666667;

  public BANDWIDTH_IMG: string = 'clouds-01.jpeg';
  public RESPONSE_TIME_HTML: string = 'test.html';

  public AWS_CLOUD_PIN_PATH = '/assets/aws_pin.png';
  public GCE_CLOUD_PIN_PATH = '/assets/google_pin.png';
  public AZURE_CLOUD_PIN_PATH = '/assets/azure_pin.svg';

  public AWS_PAGE_TITLE = 'Aviatrix - AWS Throughput and Latency Analyzer';
  public AZURE_PAGE_TITLE = 'Aviatrix - AZURE Throughput and Latency Analyzer';
  public GCE_PAGE_TITLE = 'Aviatrix - GCE Throughput and Latency Analyzer';

  public RIGHT_PANEL_TOOLTIP: string = "Aviatrix tool measures network connectivity data from your browser to cloud regions. Use this data to confidently plan cloud deployments. To measure network performance from your data center to the cloud, open the browser in the data center.";
  public LATENCY_CHART_TOOLTIP: string = "Measures latency from the browser to cloud regions. Use latency to determine deployment of latency sensitive applications. To measure network performance from your data center to the cloud, open the browser in the data center.";
  public THROUGHPUT_PANEL_TOOLTIP: string = "Measures throughput from the browser to cloud regions. Use throughput data for data intensive applications. To measure network performance from your data center to the cloud, open the browser in the data center.";

  public SHARE_POST: string ='Checkout the cool free cloud speed test from Aviatrix!';

  public GOOGLE_API_KEY: string = 'AIzaSyAAPCDwjWqAyGu01LSKytb4tQIjQSrKw30';  // For development
  // public GOOGLE_API_KEY: string = 'AIzaSyD9N5DDr-Lzla4dTHE2ZpysyxkMtZFBpUo'; // For Production key

  public AWS_DOWNLOAD_URL: string = 'https://aws.amazon.com/marketplace/seller-profile/ref=dtl_pcp_sold_by?id=ba8fdede-964b-475d-b679-0f9f899f6293';
  public AZURE_DOWNLOAD_URL: string = 'https://azure.microsoft.com/en-us/marketplace/partners/aviatrix-systems/aviatrix-cloud-services/';
  public DOWNLOAD_URL: string = 'http://aviatrix.com/download/';

  currentTool: string = null;
  currentToolName: string = null;
  constructor() {
  }

  setcurrentTool(currentTool) {
    this.currentTool = currentTool;
  }

  getCurerntTool() {
    return this.currentTool;
  }

  setcurrentToolName(currentToolName) {
    this.currentToolName = currentToolName;
  }

  getCurerntToolName() {
    return this.currentToolName;
  }

}