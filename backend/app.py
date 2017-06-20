import json
import service
from flask import Flask, request, Response

app = Flask(__name__)



@app.route('/api/speedtest', methods=['POST'])
def get_speedtest():
    data = json.loads(request.data)
    cloud_id = data.get('cloud_id', None)
    source_region = data.get('source_region', None)
    timestamp = data.get('timestamp', None)
    if not (cloud_id and source_region):
        return Response("Bad Request", status=500)
    latency_throughput = service.get_letency_throughput(cloud_id, source_region, timestamp)
    if latency_throughput:
        resp = Response(json.dumps(latency_throughput), status=200)
    else:
        resp = Response("Internal Server Error", status=500)
    return resp


@app.route('/api/speedtest', methods=['PUT'])
def save_speedtest():
    # data = request.data
    data = json.loads(request.data)
    latency_throughput = data.get('latency_throughput', [])
    cloud_id = data.get('cloud_id', None)
    if not (cloud_id and latency_throughput):
        return Response("Bad Request", status=500)
    service.save_letency_throughput(cloud_id, latency_throughput)
    resp = Response(status=200)
    return resp


if __name__ == '__main__':
    app.run()
