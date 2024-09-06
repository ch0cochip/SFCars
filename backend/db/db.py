import pymongo

CONNECTION_STRING = "mongodb+srv://z5320020:z5320020@comp3900-testing-enviro.h7vby3z.mongodb.net/?retryWrites=true&w=majority"

def get_database():
    client = pymongo.MongoClient(CONNECTION_STRING)
    return client["comp3900"]

