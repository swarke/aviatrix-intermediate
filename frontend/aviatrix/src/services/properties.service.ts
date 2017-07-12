import { Injectable, Inject } from '@angular/core';


@Injectable()
/**
 * @brief      Class for activities service.
 */
export class PropertiesService {

  // Header
  public LINK_FEEDBACK: string = 'Feedback';
  public READY_TO_IMPLEMENT: string ='Ready to implement hybrid cloud?';

  // Dashboard
  public RIGHT_PANEL_HEADER: string = 'Cloud To Cloud Network Connectivity';
  public RIGHT_PANEL_REGION_COLUMN_HEADER = 'Region';
  public RIGHT_PANEL_LATENCY_COLUMN_HEADER = 'Latency(msec)';
  public RIGHT_PANEL_THROUGHPUT_COLUMN_HEADER = 'Throughput(mbps)';

  public LATENCY_CHART_HEADER: string = 'LATENCY';
  public THROUGHPUT_CHART_HEADER: string = 'THROUGHPUT';

  public LATENCY_CHART_DATA_NOT_AVAILABLE = 'Latency data is not available.';
  public THROUGHPUT_CHART_DATA_NOT_AVAILABLE = 'Throughput data is not available.';

  public NA_TEXT: string = 'N/A';
  public MS:string = 'ms';
  public MILISECONDS = 'miliseconds';
  public MBPS: string = 'mbps';

  public START: string = 'Begin Speed Test';
  public STOP: string = 'Stop Speed Test';

  public NA_LATITUDE: number = 46.0730555556;
  public NA_LONGITUDE: number = -100.546666667;

  public AWS_DESTINATION_CLOUD_PIN_PATH = '/assets/destination-aws@2x.png';
  public GCE_DESTINATION_CLOUD_PIN_PATH = '/assets/destination-gce@2x.png';
  public AZURE_DESTINATION_CLOUD_PIN_PATH = '/assets/destination-azure@2x.png';
  public AWS_SOURCE_CLOUD_PIN_PATH = '/assets/source-aws.png';
  public GCE_SOURCE_CLOUD_PIN_PATH = '/assets/source-gce.png';
  public AZURE_SOURCE_CLOUD_PIN_PATH = '/assets/source-azure.png';

  public RIGHT_PANEL_TOOLTIP: string = "Aviatrix tool measures network connectivity data from your browser to cloud regions. Use this data to confidently plan cloud deployments. To measure network performance from your data center to the cloud, open the browser in the data center.";
  public LATENCY_CHART_TOOLTIP: string = "Measures latency from the browser to cloud regions. Use latency to determine deployment of latency sensitive applications. To measure network performance from your data center to the cloud, open the browser in the data center.";
  public THROUGHPUT_PANEL_TOOLTIP: string = "Measures throughput from the browser to cloud regions. Use throughput data for data intensive applications. To measure network performance from your data center to the cloud, open the browser in the data center.";

  public SHARE_POST: string ='Checkout the cool free cloud speed test from Aviatrix!';

  public GOOGLE_API_KEY: string = 'AIzaSyAAPCDwjWqAyGu01LSKytb4tQIjQSrKw30';  // For development
  // public GOOGLE_API_KEY: string = 'AIzaSyD9N5DDr-Lzla4dTHE2ZpysyxkMtZFBpUo'; // For Production key

  public isLoading: boolean = false;
  currentTool: string = null;
  currentToolName: string = null;
  constructor() {
  }
}