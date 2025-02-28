from dbConnector import dbCursor
from gpiozero import MotionSensor
import PyClient

dbCursor.execute(
    "SELECT gpio, description FROM tbl_sensors WHERE type='sns-pir-motion'")
result = dbCursor.fetchall()

if __name__ == '__main__':
    print('PIR SENSORS CONNECTED TO SMART-HOME-OFFICE')
    pirs = []
    dic = {}
    for row in result:
        dic['GPIO' + row[0]] = {'gpio': row[0], 'desc': row[1]}
        pirs.append(MotionSensor(int(row[0])))
    while True:
        try:
            for pir in pirs:
                # signal presence
                pir.wait_for_motion()
                res = PyClient.sendData({
                    "gpio": dic[str(pir.pin)]['gpio'],
                    "desc": dic[str(pir.pin)]['desc'],
                    "value": "1"
                })
                # print('Motion detected...')
                print(res)

                # signal absence
                pir.wait_for_no_motion()
                res = PyClient.sendData({
                    "gpio": dic[str(pir.pin)]['gpio'],
                    "desc": dic[str(pir.pin)]['desc'],
                    "value": "0"
                })
                # print('No motion detected')
                print(res)
        except KeyboardInterrupt:
            exit('LIGHT SENSORS DISCONNECTED SUCCESFULLY')
