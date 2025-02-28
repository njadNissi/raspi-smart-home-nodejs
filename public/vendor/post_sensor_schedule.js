//fecth API
document.getElementById("postEditSensorSchedule")
    .addEventListener('click', (e) => {
        e.preventDefault();
        
        const url = document.form.url.value

        const params = {
            s_gpio_idno: document.form.sensor.value,
            s_value: document.form.sensor_value.value,
            d_gpio: document.form.device.value,
            d_state: document.form.device_state.value,
        }
        console.log(JSON.stringify(params))

        const options = {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify(params)
        }

        fetch(url, options)
            .then((res) => { return res.json() })
            .then((data) => {
                Swal.fire(
                    'NJAD SMART HOME',
                    data.message,
                    'success'
                )
                setTimeout(() => {
                    // $('#alert').alert('close');
                    window.location.href = data.nextView
                }, 20000)
            })
    });