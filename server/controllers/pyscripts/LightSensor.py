from dbConnector import dbCursor
from gpiozero import LightSensor
import PyClient

dbCursor.execute(
    "SELECT gpio, description FROM tbl_sensors WHERE type='sns-light-sensitive'"
)
result = dbCursor.fetchall()

if __name__ == '__main__':
    print('LIGHT SENSORS CONNECTED TO SMART-HOME-OFFICE')
    ldrs = []
    dic = {}
    for row in result:
        dic['GPIO' + row[0]] = {'gpio': row[0], 'desc': row[1]}
        ldrs.append(LightSensor(int(row[0])))
    while True:
        try:
            for ldr in ldrs:
                ldr.wait_for_light()
                res = PyClient.sendData({
                    "gpio": dic[str(ldr.pin)]['gpio'],
                    "desc": dic[str(ldr.pin)]['desc'],
                    "value": "1"
                })
                # print('Light detected...')
                print(res)

                ldr.wait_for_dark()
                res = PyClient.sendData({
                    "gpio": dic[str(ldr.pin)]['gpio'],
                    "desc": dic[str(ldr.pin)]['desc'],
                    "value": "0"
                })
                # print('Darkness detected')
                print(res)
        except KeyboardInterrupt:
            exit('LIGHT SENSORS DISCONNECTED SUCCESFULLY')