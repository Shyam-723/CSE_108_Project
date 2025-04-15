from flask import Flask, request, jsonify
from flask_cors import CORS
app = Flask(__name__)
CORS(app)


# Predefined users, passwords, and roles
USERS = {
    "student": {"password": "123456", "role": "student"},
    "teacher": {"password": "123456", "role": "teacher"},
    "admin":   {"password": "123456",   "role": "admin"}
}

# Static course data (in a real app you might store these in the database)
courses = [
    {"course": "Physics 009", "teacher": "Susan B", "time": "TR 11:00-11:50 AM", "enrolled": "5/10"},
    {"course": "Math 131", "teacher": "Mr.B", "time": "TR 11:00-11:50 AM", "enrolled": "10/10"},
    {"course": "CSE 120", "teacher": "Susan B", "time": "TR 11:00-11:50 AM", "enrolled": "5/10"}
]

# School course offerings with an 'add' flag.
addCourse = [
    {"course": "Physics 009", "teacher": "Susan B", "time": "TR 11:00-11:50 AM", "enrolled": "5/10", "add": "-"},
    {"course": "Math 131", "teacher": "Mr.B", "time": "TR 11:00-11:50 AM", "enrolled": "10/10", "add": "+"},
    {"course": "CSE 120", "teacher": "Susan B", "time": "TR 11:00-11:50 AM", "enrolled": "5/10", "add": "+"}
]

# Login endpoint: Checks username and password
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username and Password required'}), 400

    user = USERS.get(username)
    if not user or user['password'] != password:
        return jsonify({'message': 'Username or Password incorrect'}), 401

    return jsonify({'message': f"Welcome {username}", 'role': user['role']}), 200

# Endpoint to get courses a student is enrolled in.
@app.route('/api/student/courses', methods=['GET'])
def get_student_courses():
    # In a real app, you would check the logged-in user's identity and query your database.
    # Here we simply return the static 'courses' list.
    return jsonify(courses), 200

# Endpoint to get all school courses offered (available for signup).
@app.route('/api/school/courses', methods=['GET'])
def get_school_courses():
    return jsonify(addCourse), 200

# Endpoint for course signup: expects a JSON with a course name.
@app.route('/api/student/signup', methods=['POST'])
def signup_course():
    data = request.get_json()
    course_name = data.get('course')

    if not course_name:
        return jsonify({'message': 'Course name is required'}), 400

    # Find the course in the school offerings
    for course in addCourse:
        if course["course"] == course_name:
            # Check if the course is available for signup (using the 'add' flag)
            if course.get("add") == "+":
                # For demo purposes, add the course to the student's list
                courses.append({
                    "course": course["course"],
                    "teacher": course["teacher"],
                    "time": course["time"],
                    "enrolled": course["enrolled"]
                })
                # Mark the course as not available to sign up again
                course["add"] = "-"
                return jsonify({'message': f"Successfully signed up for {course_name}"}), 200
            else:
                return jsonify({'message': f"Course {course_name} is full or already enrolled"}), 400

    return jsonify({'message': 'Course not found'}), 404

if __name__ == '__main__':
    app.run(debug=True)
