import os, threading
from Naked.toolshed.shell import execute_js, muterun_js



threading.Thread(target=os.system('python ./server/controllers/pyscripts/DcMotor.py')).start()

threading.Thread(target=os.system('python ./server/controllers/pyscripts/RpiCamStream.py')).start()

# res = execute_js('app.js')
# if res:
    # print('................SMART HOME-OFFICE SYSTEM FULLY LOADED.............')
# GPIO.cleanup()