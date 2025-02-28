//fecth API
document.querySelector('button')
    .addEventListener('click', (e) => {
        e.preventDefault();

        const url = document.form.url.value
        const weekday = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
        const days = document.querySelectorAll('input[name="days"]:checked');
        let days_of_Week = ''

        if (days.length == 0) { days_of_Week = weekday[new Date().getDay()] }//not everyday
        else if (days.length == 7) { days_of_Week = '*' }//not never
        else { //some days
            for (var day of days) {
                days_of_Week += (days_of_Week.length >= 3) ? ',' : ''
                days_of_Week +=  day.value
            }
        }

        const params = {
            gpio: document.form.gpio.value,
            startTime: document.form.startTime.value,
            stopTime: document.form.stopTime.value,
            state: document.form.taskState.value,
            days_of_Week: days_of_Week,
            durationHours : document.form.hours.value,
            durationMins: document.form.minutes.value
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
                }, 20000)
            })
    });