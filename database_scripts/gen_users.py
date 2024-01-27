import mysql.connector
from faker import Faker
from dotenv import load_dotenv
import os
import sys


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
    def_passwd = "password"
    
    # Insert new users using random name and default password
    for i in range(user_count):
        insert_query = "INSERT INTO user (username, password) VALUES (%s, %s)"
        tmp_username = fake.name()
        values = (tmp_username, def_passwd)
        cursor.execute(insert_query, values)
        print(values)
    
    db.commit()
    cursor.close()
    db.close()