from flask import Flask, request, jsonify
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

USERS = {
    "student": {"password": "123456", "role": "student"},
    "teacher": {"password": "123456", "role": "teacher"},
    "admin":   {"password": "123456",   "role": "admin"}
}

courses = [
    {"course": "Physics 009", "teacher": "Susan B", "time": "TR 11:00-11:50 AM", "enrolled": "5/10"},
    {"course": "Math 101", "teacher": "Mr.B", "time": "TR 11:00-11:50 AM", "enrolled": "10/10"},
    {"course": "CSE 120", "teacher": "Susan B", "time": "TR 11:00-11:50 AM", "enrolled": "5/10"}
]

addCourse = [
    {"course": "Physics 109", "teacher": "Susan B", "time": "TR 11:00-11:50 AM", "enrolled": "5/10", "add": "-"},
    {"course": "Math 131", "teacher": "Mr.B", "time": "TR 11:00-11:50 AM", "enrolled": "10/10", "add": "+"},
    {"course": "CSE 100", "teacher": "Susan B", "time": "TR 11:00-11:50 AM", "enrolled": "5/10", "add": "+"}
]


student_grades = {
    "Physics 009": [
        {"name": "student 1", "grade": "92"},
        {"name": "student 2", "grade": "94"},
        {"name": "student 3", "grade": "87"}
    ],
    "Physics 008": [
        {"name": "student 1", "grade": "85"},
        {"name": "student 2", "grade": "90"},
        {"name": "student 3", "grade": "82"}
    ],
    "CSE 120": [
        {"name": "student 1", "grade": "75"},
        {"name": "student 2", "grade": "90"},
        {"name": "student 3", "grade": "62"}
    ]    
}

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

@app.route('/api/student/courses', methods=['GET'])
def get_student_courses():
   
    return jsonify(courses), 200

@app.route('/api/school/courses', methods=['GET'])
def get_school_courses():
    return jsonify(addCourse), 200

@app.route('/api/student/signup', methods=['POST'])
def signup_course():
    data = request.get_json()
    course_name = data.get('course')

    if not course_name:
        return jsonify({'message': 'Course name is required'}), 400

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

# Endpoint for dropping a course: expects a JSON with a course name
@app.route('/api/student/drop', methods=['POST'])
def drop_course():
    data = request.get_json()
    course_name = data.get('course')

    if not course_name:
        return jsonify({'message': 'Course name is required'}), 400

    for i, course in enumerate(courses):
        if course["course"] == course_name:
            dropped_course = courses.pop(i)
            
            for school_course in addCourse:
                if school_course["course"] == course_name:
                    school_course["add"] = "+"
                    break
                    
            return jsonify({'message': f"Successfully dropped {course_name}"}), 200

    return jsonify({'message': 'Course not found or not enrolled'}), 404

@app.route('/api/teacher/students/<course_name>', methods=['GET'])
def get_course_students(course_name):
    if course_name in student_grades:
        return jsonify(student_grades[course_name]), 200
    else:
        return jsonify({"message": "Course not found"}), 404

@app.route('/api/teacher/update-grade', methods=['POST'])
def update_grade():
    data = request.get_json()
    course_name = data.get('course')
    student_name = data.get('student')
    new_grade = data.get('grade')
    
    if not course_name or not student_name or not new_grade:
        return jsonify({"message": "Course name, student name, and grade are required"}), 400
    
    if course_name not in student_grades:
        return jsonify({"message": "Course not found"}), 404
    
    for student in student_grades[course_name]:
        if student["name"] == student_name:
            student["grade"] = new_grade
            return jsonify({"message": "Grade updated successfully"}), 200
    
    return jsonify({"message": "Student not found in course"}), 404

# route to get teacher's courses
@app.route('/api/teacher/courses', methods=['GET'])
def get_teacher_courses():
    teacher_courses = [course for course in courses if course["teacher"] == "Susan B"]
    return jsonify(teacher_courses), 200

if __name__ == '__main__':
    app.run(debug=True)