from enum import Enum

AWS_INVENTORY_PATH = 'https://s3.amazonaws.com/cloudinventory/aws/inventory.json'
AZURE_INVENTORY_PATH = 'https://s3.amazonaws.com/cloudinventory/azure/inventory.json'
GCE_INVENTORY_PATH = 'https://s3.amazonaws.com/cloudinventory/gce/inventory.json'
AWS_INVENTORY_DATA = {}
AZURE_INVENTORY_DATA = {}
GCE_INVENTORY_DATA = {}

INFLUX_DB_HOST = 'localhost'
INFLUX_DB_PORT = '8086'
INFLUX_DB_USERNAME = ''
INFLUX_DB_PASSWORD = ''
INFLUX_DB_NAME = 'speedtest'

class Cloud(Enum):
    aws=1
    azure=2
    gce=3

    def __str__(self):
        return self.value


