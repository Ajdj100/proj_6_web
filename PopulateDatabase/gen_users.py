import mysql.connector
import requests
import json
from faker import Faker
import sys


if __name__ == "__main__"
    # Throw exception if no argument given
    try:
        numNewUsers = sys.argv[1]
    except:
        raise Exception("Error, expected a command line argument for the number of new rows.")
    

    # Read connection file
    conn_file = open("connection.txt")
    host = "localhost"
    db_name = "webproject"
    
    # Connect to DB
    db = mysql.connector(host, conn_file.readline(), conn_file.readline(), db_name)
    cursor = db.cursor()
    conn_file.close()
    
    # Seed Faker
    fake = Faker()
    Faker.seed(0)
    def_passwd = "password"
    
    # Insert new users using random name and default password
    for i in range(numNewUsers):
        insert_query = "INSERT INTO user (username, password) VALUES (?, ?)"
        values = (fake.name(), def_passwd)
        cursor.execute(insert_query, values)