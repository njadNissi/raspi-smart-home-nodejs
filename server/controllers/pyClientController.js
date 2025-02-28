const http = require('http')
const mailServer = require('./Mailer')

exports.sensorInfo = (req, res) => {
  const { gpio, desc, value } = req.body
  console.log('------|' + desc + '| : ' + value + '|--------|')
  mailServer.sendEmail(value)
  res.json({ 'SMART HOME-OFFICE': "'" + value + "' RECEIVED" })
}

exports.runAtPWM = (gpio, speed) => {
  let options = {
    host: '192.168.43.168', port: '5000', path: '/' + speed + 'Speed/' + gpio, method: 'GET'
  }
  const req = http.request(options, (res) => {
      res.setEncoding('utf8')
      res.on('data', (data) => { console.log(data) })
      // res.on('end', () => { console.log(speed + ' Speed for motor at gpio = ' + gpio) })
  }) //.end()

  req.on('error', (err) => {
    if (err.code == 'ECONNRESET') {
      console.log('timeout!');
      return;
    }
    console.error(err);
  });
  
  req.on('timeout', () => {
    req.destroy();
  });

  req.end();
}

exports.videostream = (req, res) => {
  let options = {
    host: '192.168.43.168', port: '8000', path: '/videostream', method: 'GET'
  }
  const videoreq = http.request(options, (res) => {
      res.setEncoding('utf8')
      res.on('data', (data) => { console.log(res) })
  })//.end()
  videoreq.on('error', (err) => {
    if (err.code == 'ECONNRESET') {
      console.log('timeout!');
      return;
    }
    console.error(err);
  });
  
  videoreq.on('timeout', () => {
    videoreq.destroy();
  });

  videoreq.end();
}