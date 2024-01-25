import string
import mysql.connector
import requests
import json
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

    # Request random poems from API 
    max_lines = '4'
    url = "https://poetrydb.org/linecount/" + max_lines

    # Get user IDs from DB
    user_query = "SELECT user_id from user;"
    cursor.execute(user_query) 
    user_id = cursor.fetchall()
     
    # Insert each poem to database with random user
    for i in range(int(numNewRows)):
        res = requests.get(url)
        res_json = res.json()

        if res.status_code != 200:
            print("Error, received " + res.status_code + " status code.")
            print("Response JSON: " + res_json) 
            exit(-1)

        # Get random user
        user_choice = choice(user_id)
        rand_user = int(user_choice[0])

        # Get title and body from random poem
        poem_choice = choice(res_json)
        title = poem_choice["title"]
        body = "I really like this poem:\n\n"
        body += "\n".join(poem_choice["lines"])

        # Execute query given values
        insert_query = "INSERT INTO post (user_id_fk, title, body) VALUES (%s, %s, %s)"
        values = (rand_user, title, body)
        cursor.execute(insert_query, values)
    
    db.commit()
    cursor.close()
    db.close()