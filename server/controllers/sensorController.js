const queries = require("./queries.json")
const connection = require('./dbConnector').connection;
const deviceSensor = require('./Device');
exports.SENSORS={}; // json


//get current state from database
exports.inputDevices = () => {
  return new Promise((resolve, reject) => {
    connection.query(queries.select.allSensors, (err, rows) => {
      if (!err) {
        let sensors = new Map()
        rows.forEach(s => { if (s.gpio != 4) sensors.set(s.gpio + s.idno, deviceSensor.Sensor(parseInt(s.gpio), s.idno)) });
        
        this.SENSORS=rows; // json
        resolve(sensors)
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

exports.form = (req, res) => {
  res.render('SensorForm')
}

// Add new device to the db
exports.create = (req, res) => {
  // const { description, gpio, type } = req.body
  const R = req.body
  const { authorization } = req.headers

  // User the connection
  connection.query(queries.insert.sensor, [R.gpio, R.idno, R.type, R.description], (err, rows) => {
    if (!err) {
      //console.log('added data: ', description, gpio, type, authorization)
      res.json({
        nextView: '/manage/device',
        message: R.description + ' REGISTRATION WAS SUCCESSFULL *|* please restart the system for update.'
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

exports.edit = (req, res) => {
  //e.g.: http://localhost:3000/edit/sensor/gpio=24&idno=NULL/
  const gpio_idno = req.params.gpio_idno
  let equalIndex = gpio_idno.indexOf('=', 0),
    andIndex = gpio_idno.indexOf('&', equalIndex),
    gpio = gpio_idno.substring(equalIndex + 1, andIndex)
  equalIndex = gpio_idno.indexOf('=', andIndex)
  idno = gpio_idno.substring(equalIndex + 1)

  connection.query(queries.select.oneSensor, [gpio, idno], (err, rows) => {
    if (!err) {
      res.render('SensorEdit', {
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

exports.update = (req, res) => {
  const { description, gpio, type } = req.body;
  const old_gpio = req.params.gpio

  connection.query(queries.update.oneSensor, [description, gpio, type, old_gpio], (err, rows) => {
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
  connection.query(queries.delete.oneSensor, [req.params.gpio], (err, rows) => {
    if (!err) {
      res.redirect('/manage/device');
    } else {
      console.log(err);
    }
    console.log('The data from sensors table: \n', rows);
  });
}