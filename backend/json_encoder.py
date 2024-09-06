import json
from bson import ObjectId
from flask.json.provider import JSONProvider

class MyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return super(MyEncoder, self).default(obj)

class CustomJSONProvider(JSONProvider):
    def dumps(self, obj, **kwargs):
        return json.dumps(obj, **kwargs, cls=MyEncoder)

    def loads(self, s: str | bytes, **kwargs):
        return json.loads(s, **kwargs)