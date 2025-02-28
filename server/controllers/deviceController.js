// const { json } = require('body-parser');
const queries = require("./queries.json")
const connection = require('./dbConnector').connection;
const deviceSensor = require('./Device');
exports.DEVICES={}; // json


exports.outputDevices = () => {
  return new Promise((resolve, reject) => {
    connection.query(queries.select.allDevices, (err, rows) => {
      if (!err) {
        let devices = new Map()
        rows.forEach(d => { devices.set(d.gpio, deviceSensor.Device(parseInt(d.gpio))) });
        
        this.DEVICES = rows;

        resolve(devices)
      } else {
        reject(err)
      }
    })
  })
}

// Find Device by Search
exports.find = (req, res) => {
  let searchTerm = req.body.search;
  // User the connection
  connection.query(queries.select.byDeviceKey, ['%' + searchTerm + '%', '%' + searchTerm + '%'], (err, rows) => {
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

exports.form = (req, res) => {
  res.render('DeviceForm')
}

// Add new device to the db
exports.create = (req, res) => {
  // const { description, gpio, type } = req.body
  const R = req.body
  const { authorization } = req.headers

  connection.query(queries.insert.device, [R.gpio, R.type, R.description], (err, rows) => {
    if (!err) {
      //console.log('added data: ', description, gpio, type, authorization)
      res.json({
        nextView: '/manage/device',
        message: 'GPIO/ID: ' + R.description + 'REGISTRATION WAS SUCCESSFULL *|* please restart the system for update.'
      })
    } else {
      console.log(err);
      res.json({
        nextView: '/add/device',
        message: 'REGISTRATION ERROR: GPIO:' + R.gpio + '  OCCUPIED...'
      })
    }
  });
}

// Edit device
exports.edit = (req, res) => {
  // User the connection
  connection.query(queries.select.oneDevice, [req.params.gpio], (err, rows) => {
    if (!err) {
      res.render('DeviceEdit', {
        description: rows[0].description,
        gpio: rows[0].gpio,
        type: rows[0].type,
        alert: 'Make sure hardware is configured accordingly!'
      })
    } else {
      console.log(err);
    }
    // console.log('The data from user table: \n', rows);
  });
}

// Update device: update the device state based on gpio
exports.update = (req, res) => {
  const { description, gpio, type } = req.body;
  const old_gpio = req.params.gpio

  connection.query(queries.update.oneDevice, [description, gpio, type, old_gpio], (err, rows) => {
    if (!err) {
      console.log('old gpio = ' + old_gpio + ' vs new gpio = ' + gpio)
      res.json({
        nextView: '/manage/device',
        message: 'GPIO: ' + gpio + ' DEVICE UPDATE WAS SUCCESSFULL'
      })
    } else {
      console.log(err);
      res.render('DeviceEdit', { alert: 'check data and try again' })
    }
  });
}

// Delete Device
exports.delete = (req, res) => {
  connection.query(queries.delete.oneDevice, [req.params.gpio], (err, rows) => {
    if (!err) {
      res.redirect('/manage/device');
    } else {
      console.log(err);
    }
    console.log('The data from devices table: \n', rows);
  });
}