//fecth API
document.querySelector('button')
    .addEventListener('click', (e) => {
        e.preventDefault();

        const url = document.form.url.value
        const sensorid = document.getElementById('sensorid')//only if SensorForm
        const params = {
            description: document.form.description.value,
            gpio: document.form.gpio.value,
            type: document.form.type.value,
            idno: (sensorid) ? sensorid.value : 'not needed'
        }

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
                }, 2000)
            })
    });