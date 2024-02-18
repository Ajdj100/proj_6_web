import os
import sys

import mysql.connector
from dotenv import load_dotenv
from faker import Faker

if __name__ == "__main__":
    # Throw exception if no argument given
    try:
        user_count = int(sys.argv[1])
    except:
        raise Exception("Error, expected a command line argument for the number of new rows.")
    
    # Load dotenv environment variables
    env_path = "../.env"
    load_dotenv(env_path)

    # Connect to DB, create cursor
    db = mysql.connector.connect(
        host=os.environ.get("HOST"), 
        user=os.environ.get("USER"), 
        password=os.environ.get("PASSWORD"), 
        database=os.environ.get("DATABASE")
    )
    cursor = db.cursor()
    
    # Seed Faker
    fake = Faker()
    Faker.seed()
    passwd = "password"
    
    # Insert new users using random name and default password
    for i in range(user_count):
        insert_query = "INSERT INTO user (username, password) VALUES (%s, %s)"
        username = fake.first_name()
        values = (username, passwd)
        cursor.execute(insert_query, values)
        print(values)
    
    db.commit()
    cursor.close()
    db.close()