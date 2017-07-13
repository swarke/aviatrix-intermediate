import { CLOUD_TOOL, AWS_INVENTORY_PATH, AZURE_INVENTORY_PATH, GCE_INVENTORY_PATH} from 'app/app-config';

/*
 * Model to handle network data
 */

export class DashboardModel {

	bandwidth: any;
	latency: any;
	responseTime: any;
	packetLoss: any;
	throughput: any;
	latencyChartData: any;
	awsRegions: any[];
	azureRegions: any[];
	gceRegions: any[];
	locations: any;
	inventoryPath: any;
	timeRanges: any;

	/*
	 * Construcotr Dashboard Model
	 */
	constructor() {
		this.clearModel();
		this.inventoryPath = {
	      "aws": AWS_INVENTORY_PATH,
	      "azure": AZURE_INVENTORY_PATH,
	      "gce": GCE_INVENTORY_PATH
    	}
    	this.timeRanges = [
	    	{
	    		"label": "Last 12 Hours",
	    		"value": "12h"
	    	},
	    	{
	    		"label": "Last 24 Hours",
	    		"value": "1d"
	    	},
	    	{
	    		"label": "Last Week",
	    		"value": "7d"
	    	},
	    	{
	    		"label": "Last 15 Days",
	    		"value": "15d"
	    	},
	    	{
	    		"label": "Last Month",
	    		"value": "30d"
	    	}
    	]
	}

	/*
	 * Clear location object
	 */
	clearLocations() {
		this.locations = {
			"aws": [],
	        "azure": [],
	        "gce": []
		}
	}

	/*
	 * Clear all the attributes of dashboard model
	 */
	clearModel() {
		this.bandwidth = [];
		this.latency = [];
		this.responseTime = [];
		this.packetLoss = [];
		this.throughput = [];
		this.latencyChartData = [];
		this.awsRegions = [];
		this.azureRegions = [];
		this.gceRegions = [];
		this.clearLocations();
	}

	/*
	 * Get the cloud regions as per the source cloud provider
	 */
	getRegions(cloud: any, sourceCloudRegion: any) {
		let regions = this.locations[cloud];
		for (let index = 0; index < regions.length; index++) {
			if(regions[index]['cloud_info']['region'] == sourceCloudRegion) {
				regions.splice(index, 1);
				break;
			}
		}
		return regions;
	}
}

/*
 * Model for speedtest 
 */
export class SpeedtestModel {

	sourceCloudProvider: any;
	sourceCloudRegion: any;
	destinationCloudRegions: any;
	destinationRegions: any[]
	timestamp: any;

	/*
	 * Construcotr Speedtest Model
	 */
	constructor() {
		this.clearModel();
	}

	/*
	 * Clear destination cloud regions object
	 */
	clearDestinationCloudRegions() {
		this.destinationCloudRegions = {
			"aws": [],
	        "azure": [],
	        "gce": []
		}
	}

	/*
	 * Clear dashboard model object
	 */
	clearModel() {
		this.sourceCloudProvider = "";
		this.sourceCloudRegion = "";
		this.destinationRegions = [];
		this.timestamp = ""
		this.clearDestinationCloudRegions();
	}

	/*
	 * set destination cloud regions
	 */
	setDestinationCloudRegions(key: any, data: any[]) {
		this.destinationRegions = this.destinationRegions.concat(data);
		this.destinationCloudRegions[key] = data;
	}
}

/*
 * Model chartModel
 */
export class ChartModel {

	chartData: any[];
	
	/*
	 * Construcotr chart Model
	 */
	constructor() {
		this.clearModel();
	}

	/*
	 * Clear chart Model object
	 */
	clearModel() {
		this.chartData = [];
	}
}

/*
 * Enum cloud provider
 */
export enum Cloud {
    aws =1 ,
    azure = 2,
    gce = 3,
}
