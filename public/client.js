/************PROCESS DATA TO/FROM Client****************************/
var socket = io()//.connect() //connect('http://192.168.43.168:3000')
const firstdevicePinNo = 2
const maxDevicesNo = 27
//const pwmPins = [12, 13, 18, 19]  /**ALREADY DEFINED IN HOME.HBS */

window.addEventListener("load", () => { //when page loads
  if (isMobile.any()) {
    //    alert('Mobile');  
    document.addEventListener("touchstart", ReportTouchStart, false);
    document.addEventListener("touchend", ReportTouchEnd, false);
    document.addEventListener("touchmove", TouchMove, false);
  } else {
    //    alert('Desktop');  
    document.addEventListener("mouseup", ReportMouseUp, false);
    document.addEventListener("mousedown", ReportMouseDown, false);
  }
});

socket.on('welcome', (data) => {
  // alert(data)
  console.log(data)
  console.log('#--->Device Type: ')
  socket.emit('join', getConnectedDevice())
})

//(1)set events for sensor buttons
/**console.log('setting sensors events')
for (let i = firstdevicePinNo; i <= maxDevicesNo; i++) {
  let gpio = 'GPIO' + i;
  socket.on(gpio, function (data) {
    let myJSON = JSON.stringify(data)
    document.getElementById(gpio).checked = data
    presentData(i, '', data)
  });
}*/

socket.on('sensorValues', (sensors) => {
  sensors.forEach(sensor => {
    console.log(sensor.state)
    let sensor_id = sensor.gpio + '_' + sensor.deviceId
    let sensorValue = (sensor.state == 1) ? 'DETECTED' : 'NO DETECTION'
    document.getElementById(sensor_id).innerHTML = sensorValue
  })
})

socket.on('ds18b20', (temps) => {/**refresh al the temp sensors automatically */
  //localStorage.setItem('ds18b20', temperature)
  temps.forEach(temp => {
    document.getElementById('4_' + temp.idno).innerHTML = temp.value
  });
})

//(1)announce new client connected device
//let myJSON = JSON.stringify(data)
//document.getElementById(gpio).checked = data
console.log('registering gpio pins')
for (let i = firstdevicePinNo; i <= maxDevicesNo; i++) {
  let gpio = 'GPIO' + i;
  socket.on(gpio, (data) => { presentData(i, '', data) });
  if (pwmPins.includes(i)) { //case pwm pin is involved
    socket.on(gpio + 'Min', (data) => { presentData(i, 'Min', data) });
    socket.on(gpio + 'Mid', (data) => { presentData(i, 'Mid', data) });
  }
}

function ReportTouchStart(e) {
  let y = e.target.previousElementSibling;
  if (y !== null) var x = y.id;
  if (x !== null) {
    for (let i = firstdevicePinNo; i <= maxDevicesNo; i++) {
      let gpio = 'GPIO' + i;
      if (x === gpio) {
        // console.log(gpio + ' toggle')
        socket.emit(gpio + 'T');  // send GPIO button toggle to server
        break
      } else if (x === gpio + "Min") {
        socket.emit(gpio + 'Min');  // send GPIO button toggle to server
        break
      } else if (x === gpio + "Mid") {
        socket.emit(gpio + 'Mid');  // send GPIO button toggle to server
        break
      }
    }

    for (let i = firstdevicePinNo; i <= maxDevicesNo; i++) {
      let gpio = 'GPIO' + i;
      if (e.target.id === gpio + "M") {
        socket.emit(gpio, 1) //touch button 'deviceId + "M"' only turns on
        presentData(i, '', 1)
        break
      }
    }
  }
}

function ReportTouchEnd(e) {
  for (let i = firstdevicePinNo; i <= maxDevicesNo; i++) {
    let gpio = 'GPIO' + i;
    if (e.target.id === gpio + "M") {
      socket.emit(gpio, 0);
      presentData(i, '', 0)
    }
  }
}

function ReportMouseDown(e) {

  var y = e.target.previousElementSibling;
  if (y !== null) var x = y.id;
  if (x !== null) {
    for (let i = firstdevicePinNo; i <= maxDevicesNo; i++) {
      let gpio = 'GPIO' + i;
      if (x === gpio) {
        // console.log('emitting ' + deviceId + 'T')
        socket.emit(gpio + 'T');  // send GPIO button toggle to node.js server
        break
      } else if (x === gpio + "Min") {
        //console.log(gpio + ' toggle')
        socket.emit(gpio + 'Min');  // send GPIO button toggle to server
        break
      } else if (x === gpio + "Mid") {
        console.log(gpio + ' toggle')
        socket.emit(gpio + 'Mid');  // send GPIO button toggle to server
        break
      }
    }
  }

  for (let i = firstdevicePinNo; i <= maxDevicesNo; i++) {
    let gpio = 'GPIO' + i;
    if (e.target.id === gpio + "M") {
      socket.emit(gpio, 1);
      presentData(i, '', 1)
      break
    }
  }
}

function ReportMouseUp(e) {
  for (let i = firstdevicePinNo; i <= maxDevicesNo; i++) {
    let gpio = 'GPIO' + i;
    if (e.target.id === gpio + "M") {
      socket.emit(gpio, 0)
      presentData(i, '', 0)
    }
  }
}

function TouchMove(e) {

}

var isMobile = {
  Android: function () {
    return navigator.userAgent.match(/Android/i);
  },
  BlackBerry: function () {
    return navigator.userAgent.match(/BlackBerry/i);
  },
  iOS: function () {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i);
  },
  Opera: function () {
    return navigator.userAgent.match(/Opera Mini/i);
  },
  Windows: function () {
    return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
  },
  any: function () {
    return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
  }
};

function getConnectedDevice() {
  if (navigator.userAgent.match(/Android/i)) {
    return 'Android Mobile'
  } else if (navigator.userAgent.match(/iPhone/i)) {
    return 'iOS Mobile'
  } else if (navigator.userAgent.match(/iPad/i)) {
    return 'iPad'
  } else if (navigator.userAgent.match(/iPad/i)) {
    return 'iPad'
  } else {
    return 'PC'
  }
};

function presentData(i, imgSuffix, data) {
  const isPwmPin = pwmPins.includes(i)
  document.getElementById('GPIO' + i + imgSuffix).checked = data

  let imgEl = document.getElementById('img-' + i)
  let deviceType = document.getElementById('type' + i).value

  if (data == 1) {
    if (deviceType == 'light') {
      imgEl.src = '/images/light-1.png'
    } else {
      imgEl.src = '/images/' + deviceType + imgSuffix + ".gif"
      if (isPwmPin) { switchPwmToggle(i, imgSuffix, data) }
    }
  } else {
    if (deviceType == 'light') {
      imgEl.src = '/images/light-0.png'
    } else {
      imgEl.src = '/images/' + deviceType + ".png"
    }
  }
}

function switchPwmToggle(gpioNo, speed, switchState) {
  const Min = document.getElementById('GPIO' + gpioNo + 'Min'),
    Mid = document.getElementById('GPIO' + gpioNo + 'Mid'),
    Max = document.getElementById('GPIO' + gpioNo + '')

  switch (speed) {
    case 'Min':
      Min.checked = switchState
      Mid.checked = 0
      Max.checked = 0
      break
    case 'Mid':
      Mid.checked = switchState
      Min.checked = 0
      Max.checked = 0
      break
    case '':
      Max.checked = switchState
      Min.checked = 0
      Mid.checked = 0
      break
  }
}