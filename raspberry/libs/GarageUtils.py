#!/usr/bin/python
# -*- coding: utf-8 -*-
# Locking
import socket, sys

# Configparser
import ConfigParser, io

# Logging
import logging
from logging.handlers import RotatingFileHandler
from logging import handlers

# Picamera
# sudo apt-get install python-picamera
import picamera


# Utility functions
#
# Locking mechanism without using .pid files (Linux only)
# import socket, sys 
#
def get_lock(name):
    get_lock._lock_socket = socket.socket(socket.AF_UNIX, socket.SOCK_DGRAM)

    try:
        get_lock._lock_socket.bind('\0' + name)
    except socket.error:
        print 'Socket lock already exists for ' + name
        sys.exit()
# End get_lock


#
# Loading config file (config.ini)
# import configParser, io
#
def load_config(directory, filename):
    with open(directory + "/" + filename) as f: 
        config_file = f.read()
    config = ConfigParser.RawConfigParser()
    config.readfp(io.BytesIO(config_file))
    return config
# End load_config


#
# Setting up logging
# import logging
# from logging.handlers import RotatingFileHandler
# from logging import handlers
#
def setup_logging(filename, loglevel, log_format, time_format, write_stdout, rotate_mb, rotate_count):
    log = logging.getLogger('')

    # Get log level from config
    loglevel = getattr(logging, loglevel, None)
    if not isinstance(loglevel, int):
        raise ValueError('Invalid log level: %s' % loglevel)
    log.setLevel(loglevel)

    # Log format
    logformat = logging.Formatter(log_format, datefmt=time_format)

    # Log to stdout if config says so
    if write_stdout:
      stdout = logging.StreamHandler(sys.stdout)
      stdout.setFormatter(logformat)
      log.addHandler(stdout)

    # Do rotating logs
    loghandler = handlers.RotatingFileHandler(filename, maxBytes=(1024000*rotate_mb), backupCount=rotate_count)
    loghandler.setFormatter(logformat)
    log.addHandler(loghandler)
    
    return log
# End setup_logging


# Super simple snapping a photo
def takeStill(file):
    camera = picamera.PiCamera()
    camera.resolution = (640, 480)
    camera.exposure_mode = 'night'
    camera.iso = 800
    camera.capture(file)
    camera.close()