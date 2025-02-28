// const { json } = require('body-parser');
const queries = require("./queries.json")
const security = require("./securityController")
const deviceScheduler = require('./deviceScheduler');
const connection = require('./dbConnector').connection;
const configs = require('./config.json')
// const { resolve } = require("path");

exports.devicesByType = (type) => {
  let devices = new Map()
  connection.query(queries.select.deviceByType, [type], (err, rows) => {
    if (!err) {
      console.log(rows)
      /*rows.forEach(d => {
        let button = new Device(parseInt(d.gpio), 'in', parseInt(d.state))
        button.setSlave(parseInt(d.img)) //slave gpio written in image
        devices.push(button)
      });*/
      rows.forEach(d => { devices.set(d.gpio, deviceSensor.Device(parseInt(d.gpio))) });
    } else {
      console.log(err);
    }
  });
  return devices;
}

const NotLoggedInAlert = 'PLEASE, LOG IN FIRST!'

connectedUsers = {}
lastConnectedDevice = ""
exports.reportDeviceType = (deviceType) => {
  lastConnectedDevice = deviceType
}

//view all the devices
exports.viewHome = (req, res) => {
  //client infos
  // console.log('   @--->Connected IP1    : ' + req.ip)//req.socket.remoteAddress
  // console.log('   @--->USERS   : ' + connectedUsers)
  /**keep track of this user's IP and Device type */
  security.AuthenticateUser(req, res, () => {
    
    connectedUsers[req.ip] = {
      "ip": req.ip,
      "type": lastConnectedDevice,
      "date": Date()
    }

    let devices = []
    let sensors = []

    connection.query(queries.select.allDevices, (err, rows) => {
      if (!err) {
        rows.forEach(d => {
          if (d.type == 'light') {//case of light : light doesn't have gif for its running
            d.img = d.type + '-' + d.state + '.png'
          } else {//other devices
            if (d.state == '1') {
              d.img = d.type + '.gif' //airfan.gif
            } else {
              d.img = d.type + '.png' //airfan.png
            }
          }
          devices.push(d) // for view
        });
      } else {
        console.log(err);
      }
    });

    connection.query(queries.select.allSensors, (err, rows) => {
      if (!err) {
        rows.forEach(d => {
          sensors.push(d) //for view
        });
      } else {
        console.log(err);
      }
      //  console.log('The data from sensors table: \n', rows);
    });
    // console.log(connectedUsers)
    res.render('Home', { devices: devices, sensors: sensors,
      update_period: configs.SENSOR_UPDATE_VALUE, update_unit: configs.SENSOR_UPDATE_UNIT });
  })
}

// Find Device by Search
exports.find = (req, res) => {
  let searchTerm = req.body.search;
  // User the connection
  connection.query('SELECT * FROM tbl_devices WHERE description LIKE ? OR type LIKE ?', ['%' + searchTerm + '%', '%' + searchTerm + '%'], (err, rows) => {
    if (!err) {
      rows.forEach(d => {
        if (d.state == '2') {
          d.state == 'Disconnected'
        }
        d.state = (d.state == '1') ? 'On' : 'Off'
      });
      console.log('result for : ', searchTerm, ' = ', rows.length)
      res.render('Devices', { devices: rows });
    } else {
      console.log(err);
    }
  });
}

//go to devices list and creation form
exports.viewAll = (req, res) => {
  security.AuthenticateUser(req, res, () => {

    connection.query(queries.select.allDevices, (err, devices) => {
      if (!err) {
        devices.forEach(d => {
          d.state = (d.state == '1') ? 'On' : 'Off'
        });
        connection.query(queries.select.allSensors, (err, sensors) => {
          if (!err) {
            // let allDevices = {...devices, ...sensors}
            let allDevices = devices.concat(sensors)
            res.render('Devices', { devices: allDevices });
          } else {
            console.log(err);
          }
        });
      } else {
        console.log(err);
      }
    });
  });

}

exports.usersConnectionHistory = (req, res) => {
  security.AuthenticateUser(req, res, () => {
    res.render('ConnectedUsers', { users: connectedUsers })
  }) 
}

exports.loginForm = (req, res) => {
  res.render('LoginForm')
}

exports.videoSurveillance = (req, res) => {
  security.AuthenticateUser(req, res, () => {
    res.writeHead(302, { location: "http://192.168.43.168:8000/", }).end();
  })
}

exports.setSensorUpdatePeriod = (req, res) => {
  setSensorUpdateInterval(req.params.period, req.params.unit)
  res.redirect('/smart-home');
}

//view schedules
exports.viewSchedules = (req, res) => {
  security.AuthenticateUser(req, res, () => {
    deviceScheduler.viewSchedules(req, res)
  })
}

setSensorUpdateInterval = (value, unit) => {
  configs.SENSOR_UPDATE_UNIT = unit
  configs.SENSOR_UPDATE_VALUE = value
}

exports.getDuration = (value, unit) => {
  switch(unit) {
    case 'S': return value * 1000;
    case 'M': return value * 60000; // 60 * 1000
    case 'H': return value * 3600000; // 60 * 60 * 1000 
  }
}