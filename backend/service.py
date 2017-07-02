from utility import get_cloud_inventory
from constants import Cloud, SAVE_INFLUX_URL, GET_INFLUX_URL
import requests
import json
import time
from datetime import datetime


def get_letency_throughput(cloud_id, source_region, destination_regions, timestamp, client):
    """

    :param cloud_id:
    :param source_region:
    :param destination_regions:
    :param timestamp:
    :param client:
    :return:
    """
    measurement = Cloud(int(cloud_id)).name
    url = GET_INFLUX_URL + "select * from %s where source_region='%s' AND" % (measurement, source_region)
    if destination_regions:
        for index, destination_region in enumerate(destination_regions):
            if index == 0:
                url += " destination_region='%s'" % destination_region
            else:
                url += " OR destination_region='%s'" % destination_region
    responce = requests.get(url)
    if responce.status_code < 300:
        result = convert_to_speedtest_format(json.loads(responce.content)['results'][0])
        return result


def save_letency_throughput(data, influx_db_client):
    """

    :param cloud_id:
    :param source_region:
    :return:
    """
    save_influx_url = 'http://localhost:8086/write?db=speedtest'
    # timestamp = int(round(time.time() * 1000))
    current_datetime_millis = long((datetime.utcnow() - datetime.utcnow().utcfromtimestamp(0)).total_seconds() * 1000.0)
    for obj in data:
        data_string = obj['measurement'] + ',source_region=' + obj['tags']['source_region'] + ',destination_region=' + \
                      obj['tags']['destination_region'] + ' latency=' + obj['fields']['latency'] + ',throughput=' + \
                      obj['fields']['throughput'] + ' ' + str(current_datetime_millis)
        requests.post(SAVE_INFLUX_URL, data=data_string)


def convert_to_speedtest_format(responce):
    """

    :param responce:
    :return:
    """
    data = responce['series'][0]
    columns = data['columns']
    result = {'data': []}
    for value in data['values']:
        region = {}
        for index, column in enumerate(columns):
            region[column] = value[index]
        if region:
            result['data'].append(region)
    return result