import mysql.connector
from faker import Faker
import sys


if __name__ == "__main__":
    # Throw exception if no argument given
    try:
        user_count = int(sys.argv[1])
    except:
        raise Exception("Error, expected a command line argument for the number of new rows.")
    

    # Read connection file
    conn_file = open("connection.txt")
    host_name = "localhost"
    db_name = "webproject"
    
    # Connect to DB
    db = mysql.connector.connect(
        host=host_name, 
        user=conn_file.readline(), 
        password=conn_file.readline(), 
        database=db_name
    )
    conn_file.close()
    cursor = db.cursor()
    
    # Seed Faker
    fake = Faker()
    Faker.seed(0)
    def_passwd = "password"
    
    # Insert new users using random name and default password
    for i in range(user_count):
        insert_query = "INSERT INTO user (username, password) VALUES (%s, %s)"
        tmp_username = fake.name()
        values = (tmp_username, def_passwd)
        cursor.execute(insert_query, values)
    
    db.commit()
    cursor.close()
    db.close()