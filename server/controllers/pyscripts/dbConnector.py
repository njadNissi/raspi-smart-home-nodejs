import mysql.connector

# set coonection
dataBase = mysql.connector.connect(host="127.0.0.1",
                                   user="gpio_user",
                                   password="Njad2303",
                                   database="smart_home_office_db")

# access connection
dbCursor = dataBase.cursor()


# close connection
# dataBase.close()