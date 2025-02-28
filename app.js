/**---------------------------------------------------------------------------- */
'use strict';
const mainController = require('./server/controllers/mainController')
const deviceScheduler = require('./server/controllers/deviceScheduler')
const pyClientController = require('./server/controllers/pyClientController')
const configs = require('./server/controllers/config.json')
let devices;
const CONNECTED_USERS = {}

const express = require('express');
const exphbs = require('express-handlebars')

require('dotenv').config();

const session = require('express-session');
const app = express();

app.use(session({ secret: 'secret', resave: true, saveUninitialized: true }));
app.set('port', process.env.PORT || 3000);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));//static resources

//server server
const server = require('http').createServer(app); //require server server, and create server with function handler()
const io = require('socket.io', 'net')(server) //require socket.io module and pass the server object (server)

//HANDLEBARS MOUSTACHE
const handlebars = exphbs.create({
    extname: '.hbs',
    helpers: {
        strCmp: function (str1, str2, options) {
            return (str1 == str2) ? options.fn(this) : options.inverse(this);
        },
        isOr: function (cond1, cond2, options) {
            return (cond1 || cond2) ? options.fn(this) : options.inverse(this);
        },
        isAnd: function (cond1, cond2, options) {
            return (cond1 && cond2) ? options.fn(this) : options.inverse(this);
        }
    }
});
app.engine('.hbs', handlebars.engine);
app.set('view engine', '.hbs');


//ROUTES
const allRoutes = require('./server/routes/appRoutes');
app.use('/', allRoutes);

//test 1
app.use(function (req, res, next) {
    res.locals.showTests = app.get('env') !== 'production' &&
        req.query.test === '1';
    next();
});

//ERRORS
// 404 catch-all handler (middleware)
app.use(function (req, res, next) {
    res.status(404);
    res.render('404');
});

// 500 error handler (middleware)
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

server.listen(app.get('port'), async () => {
    devices = await deviceScheduler.prepareActuators()
    await deviceScheduler.watchSensors() // this code is auto-repetitive, it keeps reading values change
    deviceScheduler.loadScheduledTasks() //load all future schedules
    console.log('Home-Office-Auto CLIENTS CAN CONNECT ON://localhost:' + app.get('port'));
});

// Execute this when web server listenning is terminated
process.on('SIGINT', async () => { //on ctrl+c
    console.log('Smart Home server disconnected...')
    for (const device in devices.values) {
        //manage GPIO pins
        device.pin.writeSync(0)// Turn LED off
        device.pin.unexport()// Unexport LED GPIO to free resources
    }
    /*console.log('before stopping')
    await deviceScheduler.stopSensorsWatch()
    console.log('after stopping')*/

    process.exit(); //exit completely
});

io.sockets.on('connection', (socket) => {// WebSocket Connection
    //keep track of the socket in the list
    socket.id = Math.random()
    CONNECTED_USERS[socket.id] = socket

    //welcome the client
    socket.emit('welcome', 'HAPPY TO HAVE YOU HERE!')
    //Get response from client
    socket.on('join', (data) => { mainController.reportDeviceType(data) });

    // send the current states of all devices
    devices.forEach((device, gpio) => {
        socket.emit(device.id, device.state);
    })

    // //T O G G L E   P R E S S
    devices.forEach((device, key) => {
        socket.on(device.id + 'T', (data) => {
            if (device.state) device.state = 0
            else device.state = 1

            console.log('new ' + device.id + ' value = ' + device.state)
            device.pin.writeSync(device.state) //turn LED on or off
            // device.pin.digitalWrite(device.state) // for pigpio
            io.emit(device.id, device.state); //send button status to ALL clients 
        });

        if (device.gpio == 12 || device.gpio == 13 || device.gpio == 18 || device.gpio == 19) {
            socket.on(device.id + 'Min', (data) => {
                if (device.state) {
                    device.state = 0
                    // device.pin.writeSync(device.state)
                    pyClientController.runAtPWM(device.gpio, 'Stop')
                } else {
                    device.state = 1
                    pyClientController.runAtPWM(device.gpio, 'Min')
                }
                // console.log(device.id + ' : state = ' + device.state)
                io.emit(device.id + 'Min', device.state); //send button status to ALL clients
            });

            socket.on(device.id + 'Mid', (data) => {
                if (device.state) {
                    device.state = 0
                    pyClientController.runAtPWM(device.gpio, 'Stop')
                } else {
                    device.state = 1
                    pyClientController.runAtPWM(device.gpio, 'Mid')
                }
                io.emit(device.id + 'Mid', device.state); //send button status to ALL clients
            });
        } else { // PWM DEVICES DON'T HAVE MOMENTARY PRESS
            // //M O M E N T A R Y   P R E S S
            socket.on(device.id, (data) => {
                device.state = data;
                if (device.state != device.pin.readSync()) { //only change LED if status has changed
                    device.pin.writeSync(device.state); //turn LED on or off
                    // console.log('Send new ' + device.id + ' state to ALL clients')
                    io.emit(device.id, device.state); //send button status to ALL clients 
                };
            });
        }
    })

    //Whenever someone disconnects this piece of code executed
    socket.on('disconnect', () => {
        delete CONNECTED_USERS[socket.id]
        console.log('A user disconnected');
    });


    //signal the system start
    try {
        require('./server/controllers/Mailer').sendEmail('YOUR SMART-HOMEOFFICE STARTED')
    } catch (err) {
        console.error('email not sent')
    }

    //require('./server/controllers/WxMailer').sendEmail()
});

//update sensors value once at a constant rate
const PERIOD = mainController.getDuration(configs.SENSOR_UPDATE_VALUE, configs.SENSOR_UPDATE_UNIT) //in SECONDS => duration for a data update
setInterval(() => {
    let thermostats = deviceScheduler.checkAllTemperatures()
    let sensors = Array.from(deviceScheduler.sensors.values())

    for (let socket_id in CONNECTED_USERS) {
        let socket = CONNECTED_USERS[socket_id]
        socket.emit('ds18b20', thermostats)
        socket.emit('sensorValues', sensors)
    }
    // console.log('updated after ' + PERIOD + ' ms')
}, PERIOD)