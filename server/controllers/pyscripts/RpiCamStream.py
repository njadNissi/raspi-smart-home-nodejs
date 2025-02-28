import io, picamera, logging, socketserver
from threading import Condition
from http import server

# camPageFile = open('CameraSurveillance.hbs')
# PAGE = camPageFile.read().strip()
# camPageFile.close()
PAGE = """\
<html>
<head>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
<title>Raspberry Pi - Surveillance Camera</title>
</head>
<body>
<a href="http://192.168.43.168:3000/" style="padding: 16px 20px;"><span class="fa fa-home">Home</span></a>
<center style='color:red;'><h1>YOUR VIDEO SURVEILLANCE CAMERA</h1></center>
<center><img id='data' src="stream.mjpg" width="640" height="480"></center><br>

<center>
<a href="http://192.168.43.168:8000/camera/capture" style="padding: 16px 20px;"><span class="fa fa-photo">Capture</span></a>
<a href="http://192.168.43.168:8000/camera/record" style="padding: 16px 20px;"><span class="fa fa-video-camera">Record</span></a>
<a href="http://192.168.43.168:8000/stream.mjpg" style="padding: 16px 20px;"><span class="fa fa-gear">Flip Mode</span></a>
</center>

</body>
</html>
"""

class StreamingOutput(object):

    def __init__(self):
        self.frame = None
        self.buffer = io.BytesIO()
        self.condition = Condition()

    def write(self, buf):
        if buf.startswith(b'\xff\xd8'):
            # New frame, copy the existing buffer's content and notify all
            # clients it's available
            self.buffer.truncate()
            with self.condition:
                self.frame = self.buffer.getvalue()
                self.condition.notify_all()
            self.buffer.seek(0)
        return self.buffer.write(buf)


class StreamingHandler(server.BaseHTTPRequestHandler):

    def do_GET(self):
        if self.path == '/':
            self.send_response(301) # The URL of the requested resource has been changed permanently. The new URL is given in the response.
            self.send_header('Location', '/index.html')
            self.end_headers()
        elif self.path == '/index.html':
            content = PAGE.encode('utf-8')
            self.send_response(200) # ok
            self.send_header('Content-Type', 'text/html')
            self.send_header('Content-Length', len(content))
            self.end_headers()
            self.wfile.write(content)
        elif self.path == '/stream.mjpg':
            self.send_response(200)
            self.send_header('Age', 0)
            self.send_header('Cache-Control', 'no-cache, private')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Content-Type', 'multipart/x-mixed-replace; boundary=FRAME')
            self.end_headers()
            try:
                while True:
                    with output.condition:
                        output.condition.wait()
                        frame = output.frame
                    self.wfile.write(b'--FRAME\r\n')
                    self.send_header('Content-Type', 'image/jpeg')
                    self.send_header('Content-Length', len(frame))
                    self.end_headers()
                    self.wfile.write(frame)
                    self.wfile.write(b'\r\n')
            except Exception as e:
                logging.warning('Removed streaming client %s: %s',
                                self.client_address, str(e))
        else:
            self.send_error(404)
            self.end_headers()


class StreamingServer(socketserver.ThreadingMixIn, server.HTTPServer):
    allow_reuse_address = True
    daemon_threads = True


with picamera.PiCamera(resolution='640x480', framerate=30) as camera:
    output = StreamingOutput()
    #Uncomment the next line to change your Pi's Camera rotation (in degrees)
    #camera.rotation = 90
    camera.hflip = True
    camera.start_recording(output, format='mjpeg')
    try:
        print('*****>> CAMERA SURVEILLANCE RUNNING AT localhost:8000')
        print('*****>> CAMERA SURVEILLANCE CONNECTED TO SMART-HOME-OFFICE')
        address = ('', 8000)
        server = StreamingServer(address, StreamingHandler)
        server.serve_forever()
    finally:
        camera.stop_recording()