const mysql = require('mysql');

const dbConnection = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'gpio_user',
    password: 'Njad2303',
    database: 'smart_home_office_db' //comment this line if gpiodb doesn't exist yet
});

dbConnection.connect((err) => {
    if (err) throw err;
    //console.log('Connected to smart_home_office_db!');

    dbConnection.query("CREATE DATABASE IF NOT EXISTS smart_home_office_db CHARACTER SET utf8 COLLATE utf8_general_ci;",
     function (err, result) {
        if (err) throw err;
        // console.log("smart_home_office_db created!");
      });
});

exports.connection = dbConnection;
