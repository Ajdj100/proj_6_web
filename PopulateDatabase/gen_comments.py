import mysql.connector
from faker import Faker
import sys
from random import choice


if __name__ == "__main__":
    # Throw exception if no argument given
    try:
        comment_count = int(sys.argv[1])
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
    user_query = "SELECT user_id FROM user"
    cursor.execute(user_query)
    all_user_id = cursor.fetchall()

    if not all_user_id:
        print("Error: no users in database.")
        exit()

    # Get all post ids
    post_query = "SELECT post_id FROM post"
    cursor.execute(user_query)
    all_post_id = cursor.fetchall()
    
    if not all_post_id:
        print("Error: no posts in database.")
        exit()
    
    # Insert comments into 
    for i in range(comment_count):
        
        # Select user, post id, and generate body
        user_choice = choice(all_user_id)
        user_id = int(user_choice[0])
        post_choice = choice(all_post_id)
        post_id = int(post_choice[0])
        body = fake.paragraph(nb_sentences=2)

        # Construct and execute query
        insert_query = "INSERT INTO comment (user_id, post_id, body) VALUES (%s, %s, %s)"
        values = (user_id, post_id, body)
        cursor.execute(insert_query, values)
    
    db.commit()
    cursor.close()
    db.close()
