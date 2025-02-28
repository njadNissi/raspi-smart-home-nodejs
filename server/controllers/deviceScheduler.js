const { json } = require('body-parser');

const queries = require("./queries.json")
const connection = require('./dbConnector').connection
const Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
const cron = require('node-cron');
const tempSensor = require('ds18b20-raspi');
// const mainController = require('./mainController');
const deviceController = require('./deviceController');
const sensorController = require('./sensorController');
// const { response } = require('express');
// const { CronTime } = require('cron');
// const { braceExpand } = require('minimatch');
// const { Console } = require('console');
// const { resolve } = require('path');
const mailer = require('./Mailer')
require('./Device')
let devices = new Map()
exports.sensors = new Map() // loaded in watchSensors method
var sensorSchedules;
var timeSchedules;

let LAST_SCHEDULE_ID = {}
function invertState(state) {
  switch (state) {
    case 'ON': return 'OFF'
    case 'OFF': return 'ON'
    case 1: return 0
    case 0: return 1
  }
}
function convertState(state) {
  switch (state) {
    case 'ON': return 1
    case 'OFF': return 0
    case 1:
    case '1': return 'ON'
    case 0:
    case '0': return 'OFF'
    default: return state
  }
}
function getDurationMillis(startHour, startMin, endHour, endMin) {
  return 1000 * (60 * (60 * (endHour - startHour) + (endMin - startMin)))
}
function saveScheduleInDb(gpio, startTime, cronStartTime, state) {
  connection.query(queries.insert.oneSchedule, [gpio, startTime, cronStartTime, state],
    (err, result, rows) => {
      if (err)
        console.log(err)
      else {
        LAST_SCHEDULE_ID[gpio + cronStartTime] = result.insertId
        // console.log(rows)
      }
    })
}
function executeSchedule(crontime, state, targetDevice) {
  cron.schedule(crontime, () => {
    targetDevice.state = state
    targetDevice.pin.writeSync(state)
    console.log('GPIO' + targetDevice.gpio + ' is ' + convertState(state))

    //after schedule completion remove it from DB
    let scheduleId = LAST_SCHEDULE_ID[targetDevice.gpio + crontime]
    connection.query(queries.delete.oneSchedule, [scheduleId], (err, rows) => {
      console.log('schedule ' + LAST_SCHEDULE_ID + ' COMPLETED AND REMOVED...')
      delete LAST_SCHEDULE_ID[targetDevice.gpio + crontime]
    })
  })
}
function bindSensorToDevice(binding, sensor_gpio, value) {
  let sensorGpio = binding.sensor_gpio
  let triggerValue = binding.sensor_value
  let trigeredDevice = devices.get(binding.device_gpio)

  if (sensorGpio == sensor_gpio && triggerValue == value) {
    trigeredDevice.pin.writeSync(value)

    let device = deviceController.DEVICES.filter(d => d.gpio == binding.device_gpio)[0]
    let devicedesc = device.description
    let sensor = sensorController.SENSORS.filter(s => s.gpio == sensorGpio)[0]
    let sensordesc = sensor.description

    console.log(devicedesc + ' WENT ' + convertState(triggerValue) +
    ' BECAUSE ' + sensordesc + ' VALUE IS ' + triggerValue)
    try{
      mailer.sendEmail(devicedesc + ' WENT ' + convertState(triggerValue) +
     ' BECAUSE ' + sensordesc + ' VALUE IS ' + triggerValue)
    } catch(err) {
      console.error('email not sent')
    }
    
  }
}
exports.loadScheduledTasks = () => {
  //TIME BASED TASKS
  connection.query(queries.select.allSchedules, (err, rows) => {
    if (err) { throw err }
    else {
      rows.forEach(schedule => {
        executeSchedule(schedule.cron_time, schedule.state, devices.get(schedule.gpio))
      })
    }
  })

  //SENSOR BASED TASKS

  /*connection.query(queries.select.allSensorDevices, (err, rows) => {
    if (err) { throw err }
    else {
      rows.forEach(schedule => {
        executeSchedule(schedule.cron_time, schedule.state, getDeviceByGpio(devices, parseInt(schedule.gpio)))
      })
    }
  })*/

  console.log('UNEXECUTED SCHEDULES LOADED...')
}
exports.form = (req, res) => {
  connection.query(queries.select.oneDevice, [req.params.gpio], (err, rows) => {
    if (!err) {
      res.render('ScheduleForm', {
        description: rows[0].description,
        gpio: rows[0].gpio,
        alert: 'Schedules are removed once accomplished or after system restart!'
      })
    } else {
      console.log(err);
    }
  });
}
exports.create = (req, res) => {
  const { gpio, startTime, stopTime, state, days_of_Week, durationHours, durationMins } = req.body,
    start_hour = parseInt(startTime.substring(0, 2)),
    start_min = parseInt(startTime.substring(3)),
    device = devices.get(gpio)

  //crontab expression or date object
  //* * * * * *=> seconds(optional) minutes hours day-of-month month day-of-week/
  console.log(req.body)
  const cronStartTime = start_min + ' ' + start_hour + ' * * ' + days_of_Week

  //firstly write in db to get its Id used to delete it after completion
  saveScheduleInDb(gpio, startTime + ' ' + days_of_Week, cronStartTime, convertState(state))
  executeSchedule(cronStartTime, convertState(state), device); //convertState(state): convert ON to 1 and OFF to 0.

  let message = 'GPIO: ' + gpio + ' WILL TURN ' + state + ' AT ' + startTime
  // End task after chosen duration
  if (stopTime !== '00:00') {
    const stop_hour = stopTime.substring(0, 2), stop_min = stopTime.substring(3)
    const cronStopTime = stop_min + ' ' + stop_hour + ' * * ' + days_of_Week
    const stopState = invertState(convertState(state))

    saveScheduleInDb(gpio, stopTime + ' ' + days_of_Week, cronStopTime, stopState)
    executeSchedule(cronStopTime, stopState, device);

    message += ' and ' + invertState(state) + ' at ' + stopTime + '.'

  } else if (durationHours !== '0' || durationMins !== '0') { //
    // let cronTime = 
    //keep task in db
    connection.query(queries.insert.oneSchedule, [gpio, 'at ' + durationHours + 'h ' + durationMins + ' mins after' + startTime + ' ' + days_of_Week, invertState(state)], (err, rows) => { console.log(rows) })

    //INVERT OPERATION AFTER DELAY
    setTimeout(() => {
      let endState = invertState(state)
      device.state = endState
      device.pin.writeSync(endState)
      console.log('GPIO' + gpio + ' is ' + endState)
    }, getDurationMillis(0, 0, durationHours, durationMins))

    message += invertState(state) + ' after ' + durationHours + ' h ' + durationMins + ' min.'
  }

  //respond 
  res.json({ nextView: '/', message: message })
}
//view schedules
exports.viewSchedules = (req, res) => {
  connection.query(queries.select.allSchedules, (err1, rows1) => {
    if (!err1) {
      rows1.forEach(ts => { ts.state = (ts.state == '1') ? 'ON' : 'OFF' })
      timeSchedules = rows1;

      connection.query(queries.select.allSensorsDevices, (err2, rows2) => {
        if (!err2) {
          let DEVICES = deviceController.DEVICES
          let SENSORS = sensorController.SENSORS
          rows2.forEach(ss => {
            let sensor = SENSORS.filter(s => s.gpio+s.idno == ss.sensor_gpio+ss.sensor_idno)[0]
            ss.sensordesc = sensor.description
            ss.sensor_value = convertState(ss.sensor_value)

            let device = DEVICES.filter(d => d.gpio == ss.device_gpio)[0]
            ss.devicedesc = device.description
            ss.device_state = convertState(ss.device_state)
          })
          sensorSchedules = rows2;
        } else {
          console.log(err2);
        }

        res.render('Schedules', { time_schedules: rows1, sensor_schedules: rows2 })
      })
    } else {
      console.log(err1);
    }
    // console.log('The data from user table: \n', rows);
  });
}
exports.viewSchedule = (req, res) => {
  /**get time-based schedules and sensor-based schedules */
  connection.query(queries.select.oneSchedule, [req.params.gpio], (err, tschedule) => {
    if (!err) {
      tschedule.state = (tschedule.state == '1') ? 'TURN ON' : 'TURN OFF'
      res.render('Schedules', { time_schedules: tschedule/*,  sensor_schedules: rows2*/ })
    } else {
      console.log(err);
    }
  });
}

// Find Device by Search
exports.find = (req, res) => {
  let searchTerm = req.body.search;
  // User the connection
  connection.query(queries.select.schedulesByDescOrTime, ['%' + searchTerm + '%', '%' + searchTerm + '%'], (err, rows) => {
    if (!err) {
      if (!err) {
        rows.forEach(schedule => { schedule.state = (schedule.state == '1') ? 'TURN ON' : 'TURN OFF' })
        res.render('Schedules', { schedules: rows })
      } else {
        console.log(err);
      }
    } else {
      console.log(err);
    }
  });
}

// Delete Schedule
exports.delete = (req, res) => {
  const scheduleTable = (req.query.t == 't')? queries.delete.oneSchedule : queries.delete.oneSensorDevice
  
  connection.query(scheduleTable, [req.query.id], (err, rows) => {
    if (!err) {
      res.redirect('/schedule/device');
    } else {
      console.log(err);
    }
  });
}

let thermostats = []
exports.checkAllTemperatures = () => {
  if (thermostats.length == 0) {
    connection.query(queries.select.sensorsByType, ['%ds18b20%'], (err, rows) => {
      if (!err) {
        console.log('READING DS18B20 TERMOSTATS...')
        thermostats = rows
      } else {
        console.log(err)
      }
    })
  }
  //let temps = tempSensor.readAllC(2);
  //console.log(temps)
  thermostats.forEach(t => {
    // t.value = tempSensor.readC(t.idno, 2)
    tempSensor.readC(t.idno, 2, (err, temp) => {
      if (err) {
        t.value = 'DISCONNECTED'
      } else {
        t.value = temp + '*c'
        // console.log(t.value)
      }
    })
  })

  return thermostats
}

exports.checkTemperatureOf = (deviceId) => {
  let tempC = tempSensor.readC(deviceId, 2)
  return `${tempC} *C`
}

exports.prepareActuators = async () => {
  try {
    devices = await deviceController.outputDevices()
    console.log(devices.size + ' ACTUATORS PREPARED SUCCESSFULLY...')
    return devices
  } catch (err) {
    throw err
  }
}

// Execute actuators or devices based on sensor values table
function sensorsDevicesBindings() {
  return new Promise((resolve, reject) => {
    connection.query(queries.select.allSensorsDevices, (error, rows) => {
      if (!error) {
        resolve(rows)
      } else {
        reject(error)
      }
    })
  })
}

exports.watchSensors = async () => {
  try {
    this.sensors = await sensorController.inputDevices()
    const bindings = await sensorsDevicesBindings()
    console.log('SENSORS [INPUT DEVICES] STARTED SUCCESSFULLY...')

    this.sensors.forEach((sensor, gpio) => {
      sensor.pin.watch((err, value) => {

        if (err) throw err;
        if (value != sensor.state) {
          sensor.state = value

          bindings.forEach(binding => {
            bindSensorToDevice(binding, gpio, value)
          })
        }
      })
    })
  } catch (err) {
    throw err
  }
}

exports.stopSensorsWatch = () => {
  return new Promise((resolve) => {
    this.sensors.forEach(sensor => {
      sensor.pin.unwatch(() => {
        resolve(console.log('ALL SENSORS SWITCHED OFF...'))
      })
    })
  })
}

exports.editSensorSchedule = (req, res) => {

}

/* go to sensor-device schedule form */
exports.sensorScheduleForm = (req, res) => {
  let scheduleCaller = req.query.caller /* caller: {d:device, s:digital sensor, a or t:analog sensor} */
  let gpio = req.query.gpio
  let DEVICES = deviceController.DEVICES
  let SENSORS = sensorController.SENSORS
  let sensor_gpio, sensor_idno, device_gpio

  switch (scheduleCaller) {
    case 's': // digital sensor
    case 't': // analog sensor as temperature
      sensor_gpio = gpio
      sensor_idno = req.query.idno
      device_gpio = DEVICES[0] // first gpio for first option
      break;
    case 'd':
      device_gpio = gpio
      sensor_gpio = SENSORS[0]; // first sensor for first option
      break;
  }

  res.render('Schedules', {
    new_schedule: true, device_gpio: device_gpio, sensor_gpio: sensor_gpio, sensor_idno: sensor_idno,
    devices: DEVICES, sensors: SENSORS, caller: scheduleCaller
  })

  /**offset => trigger value is '>' or '=' or'<' sensor_value */
}

/**set new sensor-device schedule */
exports.addSensorSchedule = (req, res) => {
  const { s_gpio_idno, s_value, d_gpio, d_state } = req.body
  let DEVICES = deviceController.DEVICES
  let SENSORS = sensorController.SENSORS
  let device_desc = DEVICES.filter(d => d.gpio == d_gpio)[0].description
  let sensor = SENSORS.filter(s => s.gpio+'_'+s.idno == s_gpio_idno)[0]

  //should add offset to precise wether s_value > or = or < then the given one
  connection.query(queries.insert.oneSensorDevice, [sensor.gpio, sensor.idno, d_gpio, s_value, d_state], (err, rows) => { console.log(rows) })

  res.json({
    nextView: '/schedule/device',
    message: device_desc + ' WILL BE ' + convertState(d_state) + ' WHEN :'  + sensor.description + ' IS ' + convertState(s_value)
  })
}