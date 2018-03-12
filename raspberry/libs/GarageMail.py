#!/usr/bin/python
# -*- coding: utf-8 -*-
import smtplib
from email.MIMEMultipart import MIMEMultipart
from email.MIMEText import MIMEText
from email.MIMEBase import MIMEBase
from email import encoders


# Send emails with and without attachments using your gmail account
class GarageMail:
    def __init__(self, account, password, sender):
        self.username = account
        self.password = password
        self.sender = sender
    
    def prepareServer(self):
        pass
    
    def send(self, mail):
        pass
    
    def sendPlaintext(self, sendTo, subject, message):
        pass
    
    def sendWithAttachment(self, sendTo, subject, message, attachment):
        msg = MIMEMultipart()
        msg['From'] = self.sender
        msg['To'] = sendTo
        msg['Subject'] = subject

        body = message

        filename = attachment['filename']
        attachment = open(attachment['file'], "rb")
        part = MIMEBase('application', 'octet-stream')
        part.set_payload((attachment).read())
        encoders.encode_base64(part)
        part.add_header('Content-Disposition', "attachment; filename= %s" % filename)
        msg.attach(part)

        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(self.account, self.password)
        text = msg.as_string()
        server.sendmail(self.sender, sendTo, text)
        server.quit()
    