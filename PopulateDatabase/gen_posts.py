import mysql.connector
from faker import Faker
import sys
from random import choice

if __name__ == "__main__":
    # Throw exception if no argument given
    try:
        numNewRows = sys.argv[1]
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

    # Get all user ids
    user_query = "SELECT user_id FROM user;"
    cursor.execute(user_query) 
    all_user_id = cursor.fetchall()

    if not all_user_id:
        print("Error: no users in database.")
        exit()
     
    # Insert each poem to database with random user
    for i in range(int(numNewRows)):

        # Get random user
        user_choice = choice(all_user_id)
        user_id = int(user_choice[0])

        # Get title and body from random poem
        title = fake.paragraph(nb_sentences=1, variable_nb_sentences=False)
        body = fake.paragraph(nb_sentences=6) 

        # Execute query given values
        insert_query = "INSERT INTO post (user_id, title, body) VALUES (%s, %s, %s)"
        values = (user_id, title, body)
        cursor.execute(insert_query, values)
    
    db.commit()
    cursor.close()
    db.close()