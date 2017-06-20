#!/usr/bin/env python
import argparse
import json
import datetime
import requests
import time

bandwidth_img = 'clouds-01.jpeg'
downloadSize = 2621440
server_address = 'http://127.0.0.1:5000'


def download_cloud_inventory(inventory_path):
    """
    This function defines that download cloud inventory from s3 bucket.
    :param inventory_path: Path of s3 cloud inventory bucket
    :return: return inventory
    """
    responce = requests.get(inventory_path)
    if responce.status_code < 300:
        content = responce.content
        return json.loads(content)['data']


def speedtest(locations, source_region, cloud_id):
    """
    This function defines that calculate latency and through put agains other regions from destination
    :param locations: list of regions with instance detail
    :param source_region: name of source region
    :return: dict of latenct and throughout for each region
    """
    latency_throughput = []
    source_location = [region for region in locations
                       if region['cloud_info']['region'] == source_region][0]
    destination_locations = [region for region in locations
                             if region['cloud_info']['region'] != source_region]
    timestamp = time.time()
    for destination_location in destination_locations:
        latency = get_latency(destination_location)
        throughput = get_throughput(destination_location)
        region_stat = {
            "timestamp": timestamp,
            "latency": latency,
            "throughput": throughput,
            "destination_region": destination_location['cloud_info']['region'],
            "source_region": source_location['cloud_info']['region'],
            "cloud_id": cloud_id
        }
        latency_throughput.append(region_stat)
    return {"cloud_id": cloud_id, "latency_throughput": latency_throughput}


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
    url = server_address + '/api/speedtest'
    requests.put(url, data=json.dumps(data))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    parser.add_argument('-i', '--inventory_path',
                        help='s3 inventory path')
    parser.add_argument('-s', '--source_region',
                        help='Source region')
    parser.add_argument('-c', '--cloud_id',
                        help='Cloud platform')

    args = parser.parse_args()
    locations = download_cloud_inventory(args.inventory_path)
    data = speedtest(locations, args.source_region, args.cloud_id)
    print data
    upload_speedtest_data(data)


