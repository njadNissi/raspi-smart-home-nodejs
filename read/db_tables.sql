//1---create database
CREATE DATABASE smart_home_office_db CHARACTER SET UTF-8 COLLATE utf8_general_ci;
//you can check the datase with:
SHOW DATABASES;

//2---create a new user for this database and grant it all the privileges
CREATE USER 'your_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON smart_home_office_db.* TO 'gpio_user'@'localhost';
//you can check the user with:
SELECT User, Host, Password FROM mysql.user;

//3---create tables
create table tbl_devices(
   gpio VARCHAR(2) NOT NULL UNIQUE,
   type VARCHAR(10) NOT NULL,
   description varchar(25) NOT NULL,
   PRIMARY KEY ( gpio )
);
INSERT INTO tbl_devices (gpio, type, description) values
('26', 'light',  'white led'),
('18',  'airfan', 'Livingroom AirFan'),
('12', 'airfan', 'Bedroom AirFan'),
('13', 'airfan', 'Relay Airfan'),
('25', 'light', 'Big Lamp'),
('5',  'light', 'bedroom light');

+----+------+--------+-------------------+
| id | gpio | type   | description       |
+----+------+--------+-------------------+
| 54 | 26   | light  | white led         |
| 68 | 18   | airfan | Livingroom AirFan |
| 69 | 12   | airfan | Bedroom AirFan    |
| 75 | 13   | airfan | Relay Airfan      |
| 76 | 25   | light  | Big Lamp          |
| 77 | 5    | light  | bedroom light     |
+----+------+--------+-------------------+


-- idno: sensor hardware ID. eg.: 28-092170b964aa or 28-3c06f6489b87 for a ds18b20
-- value: 20.49 (as tmperature in degree Celsius)
create table tbl_sensors(
   gpio VARCHAR(2) NOT NULL,
   idno VARCHAR(40) NOT NULL default('x'),
   type VARCHAR(25) NOT NULL,
   description varchar(25) NOT NULL,
   CONSTRAINT Gpio_Idno PRIMARY KEY ( gpio, idno )
);
INSERT INTO tbl_sensors (gpio, idno, type, description) values
('4', '28-092170b964aa', 'sns-temp-ds18b20', 'Living Room Thermostat'),
('4', '28-3c06f6489b87', 'sns-temp-ds18b20', 'Bathroom Thermostat'),
('23', '', 'sns-pir-motion', 'Gate Checker '),
('24', '', 'sns-light-sensitive', 'Main Light Detector'),
('21', '', 'sns-humidity', 'Flowers Humidity '),
('22', '', 'rain-sns', 'Rain from Meteo ');

create table tbl_users(
   id INT NOT NULL AUTO_INCREMENT,
   static_ip VARCHAR(16) NOT NULL,
   name varchar(30) NOT NULL,
   PRIMARY KEY ( id )
);

--state: value to which the device should be set at the action time.
create table tbl_schedules(
   id INT AUTO_INCREMENT,
   device_gpio VARCHAR(2) NOT NULL,
   start_time char(50) NOT NULL,
   cron_time varchar(50) NOT NULL,
   state char(1) NOT NULL, 
   PRIMARY KEY (id),
   FOREIGN KEY ( device_gpio ) REFERENCES tbl_devices(gpio)
);
-- GET DATA FOR SCHEDULES TABLE
select tbl_schedules.start_time, tbl_schedules.state, tbl_devices.description
from tbl_schedules
inner join tbl_devices
 on tbl_schedules.gpio = tbl_devices.gpio;


 fetch("products.json")
	.then(function (response) {
		return response.json();
	})
	.then(function (products) {}


ALTER TABLE tbl_sensors DELETE PRIMARY KEY
ALTER TABLE tbl_sensors ADD PRIMARY KEY ( gpio, idno );

 --sensor_value: 0, 1, 24.5C ...
 --device_state: 1:ON, 0:OFF, 2:min, 3: mid
create table tbl_sens_dev_auto(
   id INT AUTO_INCREMENT,
   sensor_gpio VARCHAR(2) NOT NULL,
   sensor_idno VARCHAR(40) NOT NULL default('x'),
   device_gpio varchar(2) NOT NULL,
   sensor_value varchar(4) NOT NULL,
   device_state char(1) NOT NULL, 
   PRIMARY KEY (id),
   FOREIGN KEY ( sensor_gpio, sensor_idno ) REFERENCES tbl_sensors(gpio, idno),
   FOREIGN KEY ( device_gpio ) REFERENCES tbl_devices(gpio)
);


