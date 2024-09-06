class Config(object):
    FLASK_ENV = "development"
    DEBUG = False
    TESTING = False

class ProductionConfig(Config):
    FLASK_ENV = 'production'

class DevelopmentConfig(Config):
    DEBUG = True

class TestingConfig(Config):
    TESTING = True
