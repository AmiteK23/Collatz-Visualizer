# This file imports and exports the Flask app from the backend folder
# This approach allows you to keep your existing folder structure

import os
import sys

# Add the backend directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

# Import the app from your existing backend file
from backend.collatz_backend import app

# No need to modify anything else - gunicorn will use the imported app object

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)