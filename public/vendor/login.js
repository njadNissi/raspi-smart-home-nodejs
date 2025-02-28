document.querySelector('button')
    .addEventListener('click', (e) => {
        e.preventDefault();

        const ssid = document.form.ssid.value
        const pwd = document.form.pwd.value

        const options = {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify({ "ssid": ssid, "password": pwd })
        }

        fetch("/secure/login", options)
            .then((res) => { return res.json() })
            .then((data) => {
                Swal.fire(
                    'NJAD SMART HOME',
                    data.message,
                    'success'
                )
                setTimeout(() => {
                    window.location.href = data.nextView
                }, 1000)
            })
    });


/***LOGIN VERIFICATION CODE*/
const ctx = document.getElementById('ctx').getContext('2d');
const WIDTH = 100;
const HEIGHT = 30;
const colors = ['white', 'blue', 'green', 'grey', 'yellow', 'red', 'orange', 'purple', 'indigo']
ctx.font = '25px Arial'
const verCode = generateCode(4)
ctx.fill();


function generateCode(length) {
    ctx.clearRect(0, 0, WIDTH, HEIGHT)
    let code = ''
    for (let i = 0; i < length; i++) {
        randDigit = Math.floor(Math.random() * 10)
        code += randDigit
        ctx.fillStyle = colors[randDigit]
        ctx.fillText(randDigit, 10 + 20 * i, HEIGHT - 5)
    }
    return code
}