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

	constructor() {
		this.clearModel();
		this.inventoryPath = {
	      "aws": AWS_INVENTORY_PATH,
	      "azure": AZURE_INVENTORY_PATH,
	      "gce": GCE_INVENTORY_PATH
    	}
	}

	clearLocations() {
		this.locations = {
			"aws": [],
	        "azure": [],
	        "gce": []
		}
	}

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

export class SpeedtestModel {

	sourceCloudProvider: any;
	sourceCloudRegion: any;
	destinationCloudRegions: any;
	destinationRegions: any[]

	constructor() {
		this.clearModel();
	}

	clearDestinationCloudRegions() {
		this.destinationCloudRegions = {
			"aws": [],
	        "azure": [],
	        "gce": []
		}
	}

	clearModel() {
		this.sourceCloudProvider = "";
		this.sourceCloudRegion = "";
		this.destinationRegions = [];
		this.clearDestinationCloudRegions();
	}

	setDestinationCloudRegions(key: any, data: any[]) {
		this.destinationRegions = this.destinationRegions.concat(data);
		this.destinationCloudRegions[key] = data;
	}
}

export enum Cloud {
    aws =1 ,
    azure = 2,
    gce = 3,
}
