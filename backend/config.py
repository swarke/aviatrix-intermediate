"""
This file holds all of the Flask
application configuration
"""
from datetime import timedelta
import app


class Config(object):
    """
    Base Configuration Class
    Contains all Application Constant
    Defaults
    """
    INFLUX_DB_HOST = 'localhost'
    INFLUX_DB_PORT = '8086'
    INFLUX_DB_USERNAME = ''
    INFLUX_DB_PASSWORD = ''
    INFLUX_DB_NAME = 'speedtest'



