#!/usr/bin/python
# -*- coding: utf-8 -*-

# Enabling custom modules path
import sys, os
sys.path.append(os.path.dirname(os.path.realpath(__file__)) + "/../../libs")


# Enable waiting
import time

# Enable GPIO
import RPi.GPIO as GPIO
GPIO.setwarnings(False)
GPIO.setmode(GPIO.BOARD)

# Garage libs
from GarageMail import GarageMail
from MotionSR501 import MotionSR501
from GarageUtils import *
    

# Starting up the motion detector
def run():

    # Make sure program is not already running
    get_lock('mailchecker_alfa') 

    # Load config
    working_dir = os.path.dirname(os.path.realpath(__file__))
    config = load_config(working_dir, "config.ini")
    
    # Set up logging
    log = setup_logging(
            filename=config.get('logging', 'logfile'), 
            loglevel=config.get('logging', 'level').upper(),
            log_format='%(asctime)s %(message)s',
            time_format='%Y-%m-%d %H:%M:%S',
            write_stdout=config.getboolean('logging', 'stdout'),
            rotate_mb=1,
            rotate_count=10)
    
    # Give the user time to set up the device before detecting motion and sending emails
    logging.info("Waiting %i seconds for sensor to warm up and user to place device..." % config.getint('notification', 'secondsPauseAtStartup'))
    time.sleep(config.getint('notification', 'secondsPauseAtStartup'))

    # Take a still of the current situation
    startup_photo = working_dir + '/snapshots/startup.jpg'
    takeStill(startup_photo)
    logging.info("Device is up and running. Startup still photo stored as %s" % startup_photo)
    
    # Send startup mail with photo in case user wants email notifications
    mail = None
    if config.getboolean('notification', 'sendMails'):
        # Setting up mail sending object
        mail = GarageMail(
                    config.get('gmail', 'account'),
                    config.get('gmail', 'password'),
                    config.get('notification', 'sendFrom'))
                    
        # Send email with still attached
        mail.sendWithAttachment(
                    config.get('notification', 'sendTo'),
                    config.get('notification', 'subjectStartup'),
                    config.get('notification', 'bodyStartup'),
                    attachment={'filename': "startup.jpg", 
                                 'file': startup_photo})
        logging.info("Sent notification startup mail to %s." % config.get('notification', 'sendTo'))
    else:
        logging.info("No notification startup email sent due to setting in config.ini")
        
    logging.info("Movement detection starts now.")
    
    # Run motion detection in a infinite loop
    detector = MotionSR501(config.getint('gpio', 'pir_pin'))
    while True:
        if detector.hasMotion():
            logging.info("Movement detected. Waiting %i seconds before taking a photo and sending mail." % config.getint('notification', 'secondsPauseBeforeNotification'))
            time.sleep(config.getint('notification', 'secondsPauseBeforeNotification'))

            detection_photo = working_dir + '/snapshots/detection.jpg'
            takeStill(detection_photo)
            logging.info("Detected still photo stored as %s" % detection_photo)

            if config.getboolean('notification', 'sendMails'):
                # mail object already set up earlier!
                # Send email with still attached
                mail.sendWithAttachment(
                            config.get('notification', 'sendTo'),
                            config.get('notification', 'subject'),
                            config.get('notification', 'body'),
                            attachment={'filename': "detection.jpg", 
                                         'file': detection_photo})
                logging.info("Sent notification detection mail to %s." % config.get('notification', 'sendTo'))
            else:
                logging.info("No notification detection email sent due to setting in config.ini")

            # Sov et antall sekund...
            logging.info("Pausing detection for %i seconds." % config.getint('notification', 'secondsPauseAfterDetection'))
            time.sleep(config.getint('notification', 'secondsPauseAfterDetection'))
            logging.info("Movement detection continues now!")
         
        else:
            # Når ingen bevegelse er oppdaget, kort venting
            time.sleep(0.5)                 # Når ingen bevegelse er oppdaget, kort venting
    
    # End while True
# end run()


if __name__ == "__main__":
  get_lock
  run()