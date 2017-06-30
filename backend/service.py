from utility import get_cloud_inventory
from constants import Cloud
import requests
import json
import time
from datetime import datetime


def get_letency_throughput(cloud_id, source_region, timestamp, client):
    """

    :param cloud_id:
    :param source_region:
    :param destination_regions:
    :return:
    """
    # inventory = get_cloud_inventory(cloud_id)
    # result = client.query('select value from aws;')
    url = 'http://localhost:8086/query?db=speedtest&q=select * from aws where destination_region=eu-west-1'
    responce = requests.get(url)
    print responce.content
    if responce.status_code < 300:
        return json.loads(responce.content)


def save_letency_throughput(data, influx_db_client):
    """

    :param cloud_id:
    :param source_region:
    :return:
    """
    url = 'http://localhost:8086/write?db=speedtest'
    # timestamp = int(round(time.time() * 1000))
    current_datetime_millis = long((datetime.utcnow() - datetime.utcnow().utcfromtimestamp(0)).total_seconds() * 1000.0)
    for obj in data:
        data_string = obj['measurement'] + ',source_region=' + obj['tags']['source_region'] + ',destination_region=' + \
                      obj['tags']['destination_region'] + ' latency=' + obj['fields']['latency'] + ',throughput=' + \
                      obj['fields']['throughput'] + ' ' + str(current_datetime_millis)
        print data_string
        requests.post(url, data=data_string)

    # for obj in data:
    #     obj['time'] = current_datetime_millis
    # resp = influx_db_client.write_points(data, time_precision='ms')
    # print resp
