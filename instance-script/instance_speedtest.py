#!/usr/bin/env python
import argparse
import json
import datetime
import requests
from enum import Enum

bandwidth_img = 'clouds-01.jpeg'
downloadSize = 2621440
server_address = 'http://34.212.249.62/multicloudapp'

# Enum for clouds
class Cloud(Enum):
    aws=1
    azure=2
    gce=3

# Dictionary for cloud inventory path
cloud_inventory = [
    {
        "cloud_provider": "aws",
        "cloud_id": "1",
        "inventory_path": "https://s3.amazonaws.com/cloudinventory/aws/inventory.json"
    },
    {
        "cloud_provider": "azure",
        "cloud_id": "2",
        "inventory_path": "https://s3.amazonaws.com/cloudinventory/azure/inventory.json"
    },
    {
        "cloud_provider": "gce",
        "cloud_id": "3",
        "inventory_path": "https://s3.amazonaws.com/cloudinventory/gce/inventory.json"
    },

]


def download_cloud_inventory():
    """
    This function defines that download cloud inventory from s3 bucket.
    :return: return inventory
    """
    data = {}
    for inventory in cloud_inventory:
        responce = requests.get(inventory['inventory_path'])
        if responce.status_code < 300:
            content = responce.content
            data.update({inventory['cloud_id']: json.loads(content)['data']})
    return data



def speedtest(locations, source_region, cloud_id):
    """
    This function defines that calculate latency and through put agains other regions from destination
    :param locations: list of regions with instance detail
    :param source_region: name of source region
    :param cloud_id: cloud id
    :return: dict of latenct and throughout for each region
    """
    latency_throughput = []
    cloud_provider = Cloud(int(cloud_id)).name
    for cloud in locations:
        regions = locations[cloud]
        for destination_location in regions:
            # continue if destnation region is equal to source region
            if cloud == cloud_id and destination_location['cloud_info']['region'] == source_region:
                continue
            latency = get_latency(destination_location)
            throughput = get_throughput(destination_location)
            region_stat = {
                "measurement": cloud_provider,
                "tags": {
                    "destination_region": destination_location['cloud_info']['region'],
                    "source_region": source_region
                },
                "fields": {
                    "latency": float('%.2f' % float(latency)),
                    "throughput": float('%.2f' % float(throughput))
                }
            }
            latency_throughput.append(region_stat)
    return {"latency_throughput": latency_throughput}


def get_latency(destination):
    """
    This function defines that calculate latency from source to destination.
    :param destination: Name of destination
    :return: return latency
    """
    start = datetime.datetime.now()
    url = '%sping?nnn=%s' % (destination['url'], start)

    requests.get(url)
    duration = datetime.datetime.now() - start
    return duration.total_seconds() * 1000


def get_throughput(destination):
    """
    This function defines that calculate throughput from source to destination.
    :param destination: Name of destination
    :return: return throughput
    """
    start_time = datetime.datetime.now()
    url = '%s%s?nnn=%s' % (destination['url'], bandwidth_img, start_time)
    requests.get(url)
    end_time = datetime.datetime.now()
    duration = end_time - start_time
    bits_loaded = downloadSize * 8
    speed_Bps = bits_loaded / duration.total_seconds()
    speed_Kbps = speed_Bps / 1024
    speed_Mbps = speed_Kbps / 1024
    return speed_Mbps


def upload_speedtest_data(data):
    """
    Upload data point on server
    :param data: Data to be upload
    :return: None
    """
    url = server_address + '/api/speedtest'
    requests.put(url, data=json.dumps(data))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('-s', '--source_region',
                        help='Source region')
    parser.add_argument('-c', '--cloud_id',
                        help='Cloud platform')

    args = parser.parse_args()
    locations = download_cloud_inventory()
    data = speedtest(locations, args.source_region, args.cloud_id)
    upload_speedtest_data(data)

