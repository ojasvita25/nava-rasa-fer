from flask import Flask
from views import views

app = Flask(__name__) # initialises the application
app.register_blueprint(views, url_prefix="/")
from flask_cors import CORS  # Import CORS


if __name__ == '__main__':
    app.run(debug=True, port=5000)
    CORS(app)  # Enable CORS(resource sharing) for the entire app
