
const security = require("./security.json")

const NotLoggedInAlert = 'PLEASE, LOG IN FIRST!'
const loginAttempts = {}

exports.AuthenticateUser = (req, res, callback) => {
  if (req.session.loggedin) {
    callback()
  } else {
    res.render('LoginForm', { alert: NotLoggedInAlert })
  }
}

exports.login = (req, res) => {
  //sid = service set identifier
  const client_ssid = req.body.ssid
  const client_pwd = req.body.password
  const system_ssid = security.ssid
  const system_pwd = security.password
  const authenticated = (client_ssid == system_ssid) &&
                        (client_pwd == system_pwd)
  const clientIp = req.socket.remoteAddress
  
  if(loginAttempts.hasOwnProperty(clientIp)) {
    loginAttempts[clientIp] += 1
  } else {
    loginAttempts[clientIp] = 0
  }

  if (loginAttempts[clientIp] < security.login_chances) {
    if (authenticated) {
      req.session.loggedin = true
      req.session.ssid = client_ssid
      delete loginAttempts[clientIp]
      res.json({
        nextView: '/smart-home',
        message: 'LOGIN SUCCESSFULL',
        value: 'success'
      })
    } else {
      res.json({
        nextView: '/',
        message: 'LOGIN FAILED: CHECK AGAIN YOUR SSID AND/OR PASSWORD.',
        value: 'warning'
      })
    }
  } else {
    res.json({
      nextView: '/',
      message: 'LOGIN BLOCKED: PLEASE, TRY AGAIN AFTER 24Hours',
      value: 'warning'
    })
  }
}


exports.logout = (req, res) => {
  /**req gets to this method only after loging in,
   bcause it's under User Connection histrory Module.*/
  req.session.loggedin = false;
  req.session.ssid = ''
  res.render('LoginForm')
}

exports.generateVerificationCode = (length) => {
  new Promise(resolve => {
    let code = ''
    for (let i = 0; i < length; i++)
      code += Math.random()
    resolve(code)
  })
}