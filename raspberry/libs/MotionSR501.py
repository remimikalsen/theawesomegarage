#!/usr/bin/python
# -*- coding: utf-8 -*-

# Detect motion with HC-SR501 PIR sensor
import RPi.GPIO as GPIO

class MotionSR501:
    def __init__(self, pin):
        GPIO.setup(pin, GPIO.IN)
        self.pin = pin
    
    def hasMotion(self):
        if GPIO.input(self.pin) == 1:
            return True
        else:
            return False
 