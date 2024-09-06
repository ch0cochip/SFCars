from ..db import db

mydb = db.get_database()
mycol = mydb["UserAccount"]

mycol.delete_many({})
