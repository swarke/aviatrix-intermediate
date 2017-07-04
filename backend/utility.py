import constants
import requests
import json


def get_cloud_inventory(cloud_id):
    """

    :param cloud_id:
    :return:
    """
    if constants.Cloud.aws.value == cloud_id:
        if constants.AWS_INVENTORY_DATA:
            return constants.AWS_INVENTORY_DATA
    elif constants.Cloud.azure.value == cloud_id:
        if constants.AZURE_INVENTORY_DATA:
            return constants.AZURE_INVENTORY_DATA
    elif constants.Cloud.gce.value == cloud_id:
        if constants.GCE_INVENTORY_DATA:
            return constants.GCE_INVENTORY_DATA
    else:
        raise Exception('Invalid cloud ID')

    if constants.Cloud.aws.value == cloud_id:
        responce = requests.get(constants.AWS_INVENTORY_PATH)
        if responce.status_code < 300:
            content = responce.content
            constants.AWS_INVENTORY_DATA = json.loads(content)['data']
            return constants.AWS_INVENTORY_DATA
    elif constants.Cloud.azure.value == cloud_id:
        responce = requests.get(constants.AZURE_INVENTORY_PATH)
        if responce.status_code < 300:
            content = responce.content
            constants.AZURE_INVENTORY_DATA = json.loads(content)['data']
            return constants.AZURE_INVENTORY_DATA
    elif constants.Cloud.gce.value == cloud_id:
        responce = requests.get(constants.GCE_INVENTORY_PATH)
        if responce.status_code < 300:
            content = responce.content
            constants.GCE_INVENTORY_DATA = json.loads(content)['data']
            return constants.GCE_INVENTORY_DATA
