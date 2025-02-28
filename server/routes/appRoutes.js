const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController')
const deviceController = require('../controllers/deviceController')
const sensorController = require('../controllers/sensorController')
const deviceScheduler = require('../controllers/deviceScheduler')
const pyClientController = require('../controllers/pyClientController')
const securityController = require('../controllers/securityController')
//Routes : Device

/**MAIN CONTROLLER : entry points for the system*/
router.get('/smart-home', mainController.viewHome);//home page
router.get('/manage/device', mainController.viewAll);//go to view all devices table
router.get('/history/users', mainController.usersConnectionHistory)
router.get('/schedule/device', mainController.viewSchedules);//go to schedules page
router.get('/surveillance/video-stream', mainController.videoSurveillance)
router.get('/', mainController.loginForm)
router.get('/shedule/sensor-update-period/:period/:unit', mainController.setSensorUpdatePeriod)

/**SECURITY CONTROLLER */
router.get('/security/user-logout', securityController.logout)
router.post('/secure/login', securityController.login)


/**DEVICES CONTROLLER */
router.get('/add/device', deviceController.form);//go to add device page
router.get('/edit/device/:gpio', deviceController.edit);//go to edit page
router.get('/delete/device/:gpio', deviceController.delete);//delete device
router.post('/find/device', deviceController.find)
router.post('/add/device', deviceController.create)//register new device to db
router.post('/edit/device/:gpio', deviceController.update);//send changes to db


/**SENSORS CONTROLLER */
router.get('/add/sensor', sensorController.form);//go to add device page
router.get('/edit/sensor/:gpio_idno', sensorController.edit);//go to edit page
router.post('/add/sensor', sensorController.create)//register new device to db
router.post('/edit/sensor/:gpio', sensorController.update);//send changes to db


/**SCHEDULES CONTROLLER */
router.get('/schedule/device/:gpio', deviceScheduler.viewSchedule);//view one device schedule
router.get('/add/t-schedule/:gpio', deviceScheduler.form);//go to time scheduler page
router.get('/add/s-schedule/', deviceScheduler.sensorScheduleForm);//go to sensor scheduler page
//go to sensor scheduler page: caller: {d:device, s:digital sensor, a:analog sensor}
router.get('/edit/s-schedule/', deviceScheduler.editSensorSchedule);
router.get('/delete/schedule/', deviceScheduler.delete);//delete t-schedule
router.post('/schedule/device', deviceScheduler.create)//save t-schedule settings
router.post('/add/s-schedule/', deviceScheduler.addSensorSchedule)//save s-schedule settings
// router.post('/update/s-schedule/:id', deviceScheduler.addSensorSchedule)


/**PY CLIENT CONTROLLER */
router.post('/sensorInfo', pyClientController.sensorInfo)

module.exports = router;