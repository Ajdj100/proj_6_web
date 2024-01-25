import requests
import mysql.connector
import json
from sys import sys
from random import randint

if __name__ == "__main__":
    # Throw exception if no argument given
    try:
        numNewRows = sys.argv[1]
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

    # Request random poems from API 
    url = "https://poetrydb.org/random/" + numNewRows
    res = requests.get(url)
    res_json = json.loads(res.json())

    if res.status_code != 200:
        print("Error, received " + res.status_code + " status code.")
        print("Response JSON: " + res_json) 
        exit(-1)

    # Get user IDs from DB
    user_query = "SELECT userID from user;"
    cursor.execute(user_query) 
    user_id = cursor.fetchall()
     
    # Insert each poem to database with random user
    for i in range(numNewRows):
        insert_query = "INSERT INTO posts (userID, title, body) VALUES (%s, %s, %s)"
        rand_id = randint(user_id)
        title = res_json[i]["title"]
        body = "".join(res_json[i]["lines"])
        values = (rand_id, title, body)
        cursor.execute(insert_query, values)