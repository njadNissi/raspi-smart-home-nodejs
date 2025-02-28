from dbConnector import dbCursor
import RPi.GPIO as GPIO
from flask import (
    Flask,
)

app = Flask(__name__)

# keep a dictionary of devices and their objects
GPIO.setwarnings(False) 
GPIO.setmode(GPIO.BCM)
motors = {}
dic = {}


def motorSpeed(gpio, speed):
    motor = motors.get(gpio)
    dutyCycle = { 'Min': 50, 'Mid': 75, 'Max': 100 }
    motor.start(dutyCycle.get(speed))

@app.route('/StopSpeed/<int:gpio>', methods=['GET'])
def stop(gpio):
    print('GPIO = ' + str(gpio))
    motor = motors.get(gpio)
    motor.stop()
    return 'MOTOR STOPPED'


@app.route('/MinSpeed/<int:gpio>', methods=['GET'])
def min(gpio):
    print('GPIO = ' + str(gpio))
    motorSpeed(gpio, 'Min')
    return 'RUNNING AT MINIMUM SPEED'


@app.route('/MidSpeed/<int:gpio>', methods=['GET'])
def mid(gpio):
    print('GPIO = ' + str(gpio))
    motorSpeed(gpio, 'Mid')
    return 'RUNNING AT MEDIUM SPEED'


if __name__ == '__main__':
    dbCursor.execute(
        "SELECT gpio, description FROM tbl_devices WHERE type='airfan'")
    result = dbCursor.fetchall()
    print('*****>> DC MOTORS CONNECTED TO SMART-HOME-OFFICE', result)

    for row in result:
        dic['GPIO' + row[0]] = {'gpio': row[0], 'desc': row[1]}
        GPIO.setup(int(row[0]), GPIO.OUT) # declat as output
        motors[int(row[0])] = GPIO.PWM(
            int(row[0]), 1.0/4
        )  # set at work frequency at 0.5Hz => once evry two seconds
        # print('Motor at ' + row[0])
        
    app.run(host='192.168.43.168', debug=True)
    

# GPIO.cleanup()