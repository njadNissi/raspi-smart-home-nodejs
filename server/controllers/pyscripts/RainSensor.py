from time import sleep
from dbConnector import dbCursor
from gpiozero import InputDevice
import PyClient

# preparing a cursor object
dbCursor.execute(
    "SELECT gpio, description FROM tbl_sensors WHERE type='sns-rain-detection'"
)
result = dbCursor.fetchall()

# Disconnecting from the server
# dataBase.close()

if __name__ == '__main__':
    print('RAIN SENSORS CONNECTED TO SMART-HOME-OFFICE')
    rain_sensors = []
    dic = {}
    for row in result:
        dic['GPIO' + row[0]] = {'gpio': row[0], 'desc': row[1]}
        rain_sensors.append(InputDevice(int(row[0])))
    while True:
        try:
            for raindrop in rain_sensors:
                # signal presence
                if raindrop.is_active:
                    res = PyClient.sendData({
                        "gpio":
                        dic[str(raindrop.pin)]['gpio'],
                        "desc":
                        dic[str(raindrop.pin)]['desc'],
                        "value":
                        "1"
                    })
                    # print('Rain detected...')
                    print(res)

                sleep(30)

                # signal absence
                if not raindrop.is_active:
                    res = PyClient.sendData({
                        "gpio":
                        dic[str(raindrop.pin)]['gpio'],
                        "desc":
                        dic[str(raindrop.pin)]['desc'],
                        "value":
                        "0"
                    })
                    # print('No rain detected')
                    print(res)

                sleep(30)
        except KeyboardInterrupt:
            exit('LIGHT SENSORS DISCONNECTED SUCCESFULLY')
