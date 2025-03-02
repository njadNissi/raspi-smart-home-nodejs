# SmartHome Design and Implementation

Design and Implementation of Smart Home with NodeJS (JavaScript) and Flask (Python).
Follow on https://youtu.be/JXRoLd9TInw.



# Final Result

![Alt text](public/images/results/Hardware-system.png)

# System Schematic

![Alt text](public/images/results/two_systems.svg)

# Hardware Components

![Alt text](public/images/results/smart_home-hardware_components.png)

# Software

## Data Visualization

- Control Block

![Alt text](public/images/results/control_block.PNG)

- Devices List

![Alt text](public/images/results/setted_devices.PNG)

- Register New Device

![Alt text](public/images/results/smart_home-new-device.png)

- Tasks Scheduling and Automation

![Alt text](public/images/results/device_scheduler.PNG)

- Awaiting scheduled tasks

![Alt text](public/images/results/awaiting_schedules.PNG)

- Realtime Webcam Streaming

![Alt text](public/images/results/smart_home-webcam.png)

## Security Measures

- Credentials check 

![Alt text](public/images/results/smart_home-security.png)

- Connected Users

![Alt text](public/images/results/connected_users.PNG)

- Email Notifications

![Alt text](public/images/results/smart_home-emails.png)

## Data Storage

![Alt text](public/images/results/smart_home_office_db.png)

# Run System

1. Burn Raspbian OS on your raspberry pi, connect to WiFI or LAN then Install git, your favorite IDE, MySQL/MongoDB and nodejs. visit `https://www.w3schools.com/nodejs/` for guidance.
2. Download this repo or simply clone it with ssh if available: 
    ```
        git clone git@github.com:njadNissi/raspi-smart-home-nodejs.git
    ```
    Otherwise use the https:
    ```
        git clone https://github.com/njadNissi/raspi-smart-home-nodejs
    ```
    then open the project with your favorite IDE. here the bash terminal is used, open with:
    ```
        cd raspi-smart-home-nodejs
    ```
3. Install dependencies:
    ```
        npm install
    ```
5. Create the project database: USe your favorite SQL IDE or the terminal to execute all the commands inside `read/db_tables.sql`.
6. Start the servers:
    - Open a first terminal window and run the main webserver: 
    ```
        node app.js
    ```
    - Open a second terminal window and run:
    ```
        python3 camera_client.py if webcam available:
    ```
    - Open a third terminal window and run if PWM devices control needed:
    ```
        python3 pwm_client.py
    ```

![Alt text](public/images/results/app_js_terminal.PNG)

7. Login to the Webapp with your credentials as you specified in `server/controllers/security.json`


Explore the system to register available devices and sensors. To activate Email notifications, activate 2Factor-Authentication on your SMTP service provider (Gmail or QQMail are already implemented). Setup your credentials in `server/controllers/Mailer.js`.


----

Issues are welcome!
Contact me personally from the contacts on my profile if needed.
Thanks