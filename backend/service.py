from constants import Cloud, SAVE_INFLUX_URL, GET_INFLUX_URL
import requests
import json
from datetime import datetime


def get_letency_throughput(cloud_id, source_region, destination_regions, timestamp, influx_db_client):
    """
    This functions defines that it get the latency and throughput from influxdb for specific timeseries and
    destination cloud regions
    :param cloud_id: cloud id
    :param source_region: name of source region
    :param destination_regions: list of destination cloud regions
    :param timestamp: timestamp renge
    :param influx_db_client:
    :return:
    """
    measurement = Cloud(int(cloud_id)).name
    # url = GET_INFLUX_URL + "select * from %s where source_region='%s' AND" % (measurement, source_region)
    # query = "select * from test_table where source_region='%s' AND" % source_region
    query = "select * from %s where source_region='%s' AND" % (measurement, source_region)
    if destination_regions:
        for index, destination_region in enumerate(destination_regions):
            if index == 0:
                query += " (destination_region='%s'" % destination_region
            else:
                query += " OR destination_region='%s'" % destination_region
    # responce = requests.get(url)
    # if responce.status_code < 300:
    #     result = convert_to_speedtest_format(json.loads(responce.content)['results'][0])
    #     return result
    query += ')'
    if timestamp:
        query += ' AND time > now() - %s' % timestamp
    responce = influx_db_client.query(query)
    print type(responce)
    if responce.error:
        raise Exception('Internal server error')
    result = convert_to_speedtest_format(responce.raw)
    return result


def save_letency_throughput(data, influx_db_client):
    """

    :param cloud_id:
    :param source_region:
    :return:
    """
    current_datetime_millis = long((datetime.utcnow() - datetime.utcnow().utcfromtimestamp(0)).total_seconds() * 1000.0)
    # for obj in data:
    #     data_string = obj['measurement'] + ',source_region=' + obj['tags']['source_region'] + ',destination_region=' + \
    #                   obj['tags']['destination_region'] + ' latency=' + obj['fields']['latency'] + ',throughput=' + \
    #                   obj['fields']['throughput'] + ' ' + str(current_datetime_millis)
    #     print data_string
    #     print SAVE_INFLUX_URL
    #     requests.post(SAVE_INFLUX_URL, data=data_string)
    set_timestamp_in_data(data, current_datetime_millis)
    influx_db_client.write_points(data, time_precision='ms')


def set_timestamp_in_data(points, current_datetime_millis):
    for point in points:
        point['time'] = current_datetime_millis


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