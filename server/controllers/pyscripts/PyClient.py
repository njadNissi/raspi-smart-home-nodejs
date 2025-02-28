import http.client, json


def sendData(text):
    conn = http.client.HTTPConnection('localhost', 3000) # 192.168.43.168
    headers = {'Content-type': 'application/json'}
    conn.request('POST', '/sensorInfo', json.dumps(text), headers)
    return conn.getresponse().read().decode()