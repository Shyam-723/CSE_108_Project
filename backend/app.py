from flask import Flask, request, jsonify
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

# Predefined users, passwords, and roles
USERS = {
    "student": {"password": "123456", "role": "student"},
    "susan": {"password": "123456", "role": "teacher", "name": "Susan B"},
    "mr.b": {"password": "123456", "role": "teacher", "name": "Mr.B"},
    "admin": {"password": "123456", "role": "admin"}
}

# Static course data (in a real app you might store these in the database)
courses = [
    {"course": "Physics 009", "teacher": "Susan B", "time": "TR 11:00-11:50 AM", "enrolled": "25/40"},
    {"course": "Math 131", "teacher": "Mr.B", "time": "TR 11:00-11:50 AM", "enrolled": "30/30"},
    {"course": "CSE 120", "teacher": "Susan B", "time": "TR 11:00-11:50 AM", "enrolled": "18/20"}
]

# School course offerings with an 'add' flag.
addCourse = [
    {"course": "Cogs 97", "teacher": "Susan B", "time": "TR 11:00-11:50 AM", "enrolled": "15/15", "add": "-"},
    {"course": "Math 141", "teacher": "Mr.B", "time": "TR 11:00-11:50 AM", "enrolled": "30/45", "add": "+"},
    {"course": "CSE 110", "teacher": "Susan B", "time": "TR 11:00-11:50 AM", "enrolled": "25/40", "add": "+"}
]

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

    return jsonify({
        'message': f"Welcome {username}",
        'role': user['role'],
        'displayName': user.get('name', username)  # fallback if no name
    }), 200

@app.route('/api/teacher/courses', methods=['POST'])
def get_teacher_courses():
    data = request.get_json()
    teacher_name = data.get('name')  # "Susan B" or "Mr.B"
    filtered = [c for c in courses if c['teacher'] == teacher_name]
    return jsonify(filtered), 200

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


@app.route('/api/student/drop', methods=['POST'])
def drop_course():  
    data = request.get_json()
    course_name = data.get('course')

    if not course_name:
        return jsonify({'message': 'Course name is required'}), 400

    # Find and remove the course from the student's enrolled list
    for course in courses:
        if course["course"] == course_name:
            courses.remove(course)
            # Also make the course available again for signup
            for add in addCourse:
                if add["course"] == course_name:
                    add["add"] = "+"
            return jsonify({'message': f"Dropped {course_name}"}), 200

    return jsonify({'message': 'Course not found in your enrolled list'}), 404



if __name__ == '__main__':
    app.run(debug=True)
