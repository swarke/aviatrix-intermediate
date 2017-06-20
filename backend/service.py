from utility import get_cloud_inventory


def get_letency_throughput(cloud_id, source_region, timestamp):
    """

    :param cloud_id:
    :param source_region:
    :param destination_regions:
    :return:
    """
    inventory = get_cloud_inventory(cloud_id)
    return inventory


def save_letency_throughput(cloud_id, data):
    """

    :param cloud_id:
    :param source_region:
    :return:
    """
    print data
    inventory = get_cloud_inventory(cloud_id)
