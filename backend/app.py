import json
import service
from flask import Flask, request, Response
from flask_cors import CORS, cross_origin
from influxdb import InfluxDBClient
import constants
# from config.Config import (INFLUX_DB_HOST, INFLUX_DB_PORT, INFLUX_DB_USERNAME, INFLUX_DB_PASSWORD, INFLUX_DB_DBNAME)
# import config


app = Flask(__name__)
CORS(app, support_credentials=True)
# client = InfluxDBClient(host=constants.INFLUX_DB_HOST, port=constants.INFLUX_DB_PORT, database=constants.INFLUX_DB_NAME)
influx_db_client = InfluxDBClient(host=constants.INFLUX_DB_HOST, port=constants.INFLUX_DB_PORT,
                                  username=None, password=None, database=constants.INFLUX_DB_NAME)

@app.route('/api/speedtest', methods=['POST'])
@cross_origin()
def get_speedtest():
    """
    This function defines that, get the latency and throughput for specific destination cloud regions
    :return: List of regions with latency and throughput
    """
    data = json.loads(request.data)
    cloud_id = data.get('cloud_id', None)
    source_region = data.get('source_region', None)
    destination_regions = data.get('destination_regions', [])
    timestamp = data.get('timestamp', None)
    if not (cloud_id and source_region and destination_regions and timestamp):
        return Response("Bad Request", status=500)
    latency_throughput = service.get_letency_throughput(cloud_id, source_region, destination_regions, timestamp,
                                                        influx_db_client)
    if latency_throughput:
        resp = Response(json.dumps(latency_throughput), status=200)
    else:
        resp = Response("Internal Server Error", status=500)
    return resp


@app.route('/api/speedtest', methods=['PUT'])
def save_speedtest():
    """
    This function defines that it save the latency and throughput in influxdb
    :return:
    """
    data = json.loads(request.data)
    latency_throughput = data.get('latency_throughput', [])
    if not (latency_throughput):
        return Response("Bad Request", status=500)
    service.save_letency_throughput(latency_throughput, influx_db_client)
    resp = Response(status=200)
    return resp


if __name__ == '__main__':
    app.run()
