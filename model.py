"""Data model for bears."""

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

#---------------------------------------------------------------------#

# classes

#---------------------------------------------------------------------#

def connect_to_db(app):
    """Connect the database to Flask app."""

    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///history'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.app = app
    db.init_app(app)


if __name__ == "__main__":
    from server import app
    connect_to_db(app)
    print("Connected to DB.")
