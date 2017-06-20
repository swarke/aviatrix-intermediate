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
    DEBUG = True
    SECRET_KEY = 'Eg=C}k!5]YG`d{*`#dDZd4=*#'
    RESTFUL_JSON = {"cls": app.json_encoder}

    db_host = 'localhost:3306'
    db_user = 'root'
    db_pass = 'ramesh8264'
    SQLALCHEMY_DATABASE_URI = 'mysql://{}:{}@{}/ftpoc'.format(db_user, db_pass, db_host)
    SQLALCHEMY_POOL_SIZE = 10
    SQLALCHEMY_POOL_TIMEOUT = 10
    SQLALCHEMY_POOL_RECYCLE = 500
    SQLALCHEMY_TRACK_MODIFICATIONS = False



