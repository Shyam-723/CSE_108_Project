from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

#SQLite database intializiation
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///project.db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# This is our database
db = SQLAlchemy(app)

# Predefined users, pwd, and role
USERS = {
    "student": {"password": "pwd-student", "role": "student"},
    "teacher": {"password": "pwd-teacher", "role": "teacher"},
    "admin":   {"password": "pwd-admin",   "role": "admin"}
}

# Josh - Login Page needs to do a "POST API" request to /api/login
@app.route('/api/login', methods=['POST'])
def login():
    data.request.json()

    # Josh - Login Page needs to submit the username and password when doing API call
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message: Username and Password required'}), 400

    user = USERS.get(username)
    
    if not user or user['password'] != password:
        return jsonify({'message: Username or Password incorrect'}) , 401

    return jsonify({'message': f"Welcome {username}", 'role': user['role']}), 200


if __name__ == '__main__':
    app.run(debug=True)