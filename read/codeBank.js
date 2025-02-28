exports.runThermostats = () => {
    //set up temperature sensor
    cron.schedule('* * * * * *', () => {
        let termDevice = getDeviceByGpio(thermostats, 4)
        termDevice.description += ': ' + tempC

        tempSensor.readSimpleC(1, (err, temp) => {
            if (err) {
                console.log(err);
            } else {
                console.log(`${temp} degC`);
            }
        });
    })
}

exports.readTemperature = () => {
    let tempC = tempSensor.readSimpleC()
    return `${tempC} *C`
}

exports.checkTemperature = (req, res) => {
    let value = tempSensor.readSimpleC(req.params.deviceId)
    res.redirect('/', { alert: `${value}` })
}