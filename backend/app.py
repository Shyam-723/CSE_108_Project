from flask import Flask, request, jsonify, redirect, url_for
from flask_cors import CORS
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from flask_admin.base import AdminIndexView, expose
from flask_sqlalchemy import SQLAlchemy
import os
import json

app = Flask(__name__)
# Enable CORS for all routes and all origins
CORS(app, resources={r"/*": {"origins": "*"}})
app.secret_key = 'your_secret_key'  # Required for Flask-Admin

# Configure a simple file-based SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///course_system.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Define models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), nullable=False)

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    course_name = db.Column(db.String(80), nullable=False)
    teacher = db.Column(db.String(80), nullable=False)
    time = db.Column(db.String(80), nullable=False)
    enrolled = db.Column(db.String(20), nullable=False)
    add_status = db.Column(db.String(1), nullable=True)  # Added add_status field

class StudentCourse(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_username = db.Column(db.String(80), nullable=False)
    course_name = db.Column(db.String(80), nullable=False)

class StudentGrade(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    course_name = db.Column(db.String(80), nullable=False)
    student_name = db.Column(db.String(80), nullable=False)
    grade = db.Column(db.String(10), nullable=False)

# Admin views
class UserAdmin(ModelView):
    column_list = ('username', 'role')
    form_excluded_columns = ('password',)
    
    def on_model_change(self, form, model, is_created):
        # Keep password unchanged if not provided
        if is_created:
            model.password = "123456"  # Default password for new users

class CourseAdmin(ModelView):
    column_list = ('course_name', 'teacher', 'time', 'enrolled', 'add_status')
    
class StudentCourseAdmin(ModelView):
    column_list = ('student_username', 'course_name')

class StudentGradeAdmin(ModelView):
    column_list = ('course_name', 'student_name', 'grade')

# Custom admin index view with authentication
class MyAdminIndexView(AdminIndexView):
    @expose('/')
    def index(self):
        # Simple authentication - ensure this is enhanced in a production environment
        admin_auth = request.args.get('admin_auth')
        if admin_auth != 'yes':
            return redirect(url_for('login', next=request.url, admin_auth_required=True))
        return super(MyAdminIndexView, self).index()

# Initialize Flask-Admin
admin = Admin(app, name='Course Management Admin', template_mode='bootstrap3', index_view=MyAdminIndexView())

# Add views
admin.add_view(UserAdmin(User, db.session))
admin.add_view(CourseAdmin(Course, db.session))
admin.add_view(StudentCourseAdmin(StudentCourse, db.session))
admin.add_view(StudentGradeAdmin(StudentGrade, db.session))

# Initial data - will be stored in the database
USERS = {
    "student": {"password": "123456", "role": "student"},
    "teacher": {"password": "123456", "role": "teacher"},
    "admin":   {"password": "123456", "role": "admin"},
    "Susan B": {"password": "123456", "role": "teacher"},
    "Mr.B":    {"password": "123456", "role": "teacher"}
}
courses = [
    {"course": "Physics 009", "teacher": "Susan B", "time": "TR 11:00-11:50 AM", "enrolled": "3/10", "add": "-"},
    {"course": "Math 131", "teacher": "Mr.B", "time": "TR 11:00-11:50 AM", "enrolled": "3/10", "add": "+"},
    {"course": "CSE 120", "teacher": "Susan B", "time": "TR 11:00-11:50 AM", "enrolled": "3/10", "add": "+"},
    {"course": "Physics 008", "teacher": "Susan B", "time": "TR 9:00-9:50 AM", "enrolled": "3/10", "add": "+"}
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
        {"name": "student 1", "grade": "88"},
        {"name": "student 2", "grade": "76"},
        {"name": "student 3", "grade": "95"}
    ], 
    "Math 131": [
        {"name": "student 1", "grade": "88"},
        {"name": "student 2", "grade": "76"},
        {"name": "student 3", "grade": "95"}
    ]
}

# Method to initialize database with data
def initialize_db():
    with app.app_context():
        # Drop all existing tables and recreate them
        db.drop_all()
        db.create_all()
        
        # Add users
        for username, data in USERS.items():
            user = User(username=username, password=data["password"], role=data["role"])
            db.session.add(user)
        
        # Add courses
        for course_data in courses:
            course = Course(
                course_name=course_data["course"],
                teacher=course_data["teacher"],
                time=course_data["time"],
                enrolled=course_data["enrolled"],
                add_status=course_data.get("add", "+")  # Default to "+" if not specified
            )
            db.session.add(course)
            
            # Add enrolled courses for student
            if course_data.get("add") == "-":
                student_course = StudentCourse(
                    student_username="student",
                    course_name=course_data["course"]
                )
                db.session.add(student_course)
        
        # Add student grades
        for course_name, students in student_grades.items():
            for student in students:
                grade = StudentGrade(
                    course_name=course_name,
                    student_name=student["name"],
                    grade=student["grade"]
                )
                db.session.add(grade)
        
        db.session.commit()

# Login endpoint: Checks username and password
@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return handle_options_request()
        
    data = request.get_json()
    
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username and Password required'}), 400

    # Look up user in database
    user = User.query.filter_by(username=username).first()
    
    if not user or user.password != password:
        return jsonify({'message': 'Username or Password incorrect'}), 401

    return jsonify({'message': f"Welcome {username}", 'role': user.role, 'username': username}), 200

# Endpoint to get courses a student is enrolled in
@app.route('/api/student/courses', methods=['GET', 'OPTIONS'])
def get_student_courses():
    if request.method == 'OPTIONS':
        return handle_options_request()
        
    username = request.args.get('username', 'student')  # Default to 'student' if not provided
    
    # Get courses from database
    student_courses = StudentCourse.query.filter_by(student_username=username).all()
    course_names = [sc.course_name for sc in student_courses]
    
    # Get full course details
    enrolled_courses = Course.query.filter(Course.course_name.in_(course_names)).all() if course_names else []
    
    # Convert to list of dictionaries
    result = []
    for course in enrolled_courses:
        result.append({
            "course": course.course_name,
            "teacher": course.teacher,
            "time": course.time,
            "enrolled": course.enrolled,
            "add": "-"  # Already enrolled
        })
    
    return jsonify(result), 200

# Endpoint to get all school courses offered (available for signup)
@app.route('/api/school/courses', methods=['GET', 'OPTIONS'])
def get_school_courses():
    if request.method == 'OPTIONS':
        return handle_options_request()
        
    # Get all courses from database
    all_courses = Course.query.all()
    
    # Convert to list of dictionaries
    result = []
    for course in all_courses:
        result.append({
            "course": course.course_name,
            "teacher": course.teacher,
            "time": course.time,
            "enrolled": course.enrolled,
            "add": course.add_status
        })
    
    return jsonify(result), 200

# Endpoint for course signup: expects a JSON with a course name
@app.route('/api/student/signup', methods=['POST', 'OPTIONS'])
def signup_course():
    if request.method == 'OPTIONS':
        return handle_options_request()
        
    data = request.get_json()
    course_name = data.get('course')
    username = data.get('username', 'student')  # Default to 'student' if not provided

    if not course_name:
        return jsonify({'message': 'Course name is required'}), 400

    # Find the course in the database
    course = Course.query.filter_by(course_name=course_name).first()
    
    if not course:
        return jsonify({'message': 'Course not found'}), 404
        
    # Check if already enrolled
    existing_enrollment = StudentCourse.query.filter_by(
        student_username=username, 
        course_name=course_name
    ).first()
    
    if existing_enrollment:
        return jsonify({'message': f"Already enrolled in {course_name}"}), 400

    # Check if the course is available for signup
    if course.add_status == "+":
        # Create enrollment record
        new_enrollment = StudentCourse(
            student_username=username,
            course_name=course_name
        )
        db.session.add(new_enrollment)
        
        # Update course status
        course.add_status = "-"
        db.session.commit()
        
        return jsonify({'message': f"Successfully signed up for {course_name}"}), 200
    else:
        return jsonify({'message': f"Course {course_name} is full or already enrolled"}), 400

# Endpoint for dropping a course: expects a JSON with a course name
@app.route('/api/student/drop', methods=['POST', 'OPTIONS'])
def drop_course():
    if request.method == 'OPTIONS':
        return handle_options_request()
        
    data = request.get_json()
    course_name = data.get('course')
    username = data.get('username', 'student')  # Default to 'student' if not provided

    if not course_name:
        return jsonify({'message': 'Course name is required'}), 400

    # Find the enrollment in the database
    enrollment = StudentCourse.query.filter_by(
        student_username=username, 
        course_name=course_name
    ).first()
    
    if not enrollment:
        return jsonify({'message': 'Course not found or not enrolled'}), 404
    
    # Delete the enrollment
    db.session.delete(enrollment)
    
    # Update course status
    course = Course.query.filter_by(course_name=course_name).first()
    if course:
        course.add_status = "+"
    
    db.session.commit()
    
    return jsonify({'message': f"Successfully dropped {course_name}"}), 200

# Route to get students for a specific course
@app.route('/api/teacher/students/<course_name>', methods=['GET', 'OPTIONS'])
def get_course_students(course_name):
    if request.method == 'OPTIONS':
        return handle_options_request()
        
    # Get grades from database
    grades = StudentGrade.query.filter_by(course_name=course_name).all()
    
    if not grades:
        return jsonify({"message": "Course not found or no students enrolled"}), 404
    
    # Convert to list of dictionaries
    result = []
    for grade in grades:
        result.append({
            "name": grade.student_name,
            "grade": grade.grade
        })
    
    return jsonify(result), 200

# Route to update a student's grade
@app.route('/api/teacher/update-grade', methods=['POST', 'OPTIONS'])
def update_grade():
    if request.method == 'OPTIONS':
        return handle_options_request()
        
    data = request.get_json()
    course_name = data.get('course')
    student_name = data.get('student')
    new_grade = data.get('grade')
    
    if not course_name or not student_name or not new_grade:
        return jsonify({"message": "Course name, student name, and grade are required"}), 400
    
    # Find the grade in the database
    grade = StudentGrade.query.filter_by(
        course_name=course_name,
        student_name=student_name
    ).first()
    
    if not grade:
        return jsonify({"message": "Student not found in course"}), 404
    
    # Update the grade
    grade.grade = new_grade
    db.session.commit()
    
    return jsonify({"message": "Grade updated successfully"}), 200

# Route to get teacher's courses
@app.route('/api/teacher/courses', methods=['GET', 'OPTIONS'])
def get_teacher_courses():
    if request.method == 'OPTIONS':
        return handle_options_request()
        
    username = request.args.get('username', 'Susan B')  # Default to 'Susan B' if not provided
    
    # Get courses from database
    teacher_courses = Course.query.filter_by(teacher=username).all()
    
    # Convert to list of dictionaries
    result = []
    for course in teacher_courses:
        result.append({
            "course": course.course_name,
            "teacher": course.teacher,
            "time": course.time,
            "enrolled": course.enrolled,
            "add": course.add_status
        })
    
    return jsonify(result), 200

# Admin API endpoints
@app.route('/api/admin/data', methods=['GET', 'OPTIONS'])
def admin_data():
    """Get all data for admin dashboard"""
    if request.method == 'OPTIONS':
        return handle_options_request()
    
    # Get users from database
    users_query = User.query.all()
    users = {}
    for user in users_query:
        users[user.username] = {
            "password": user.password,
            "role": user.role
        }
    
    # Get courses from database - direct dictionary conversion to avoid ORM column issues
    courses_query = Course.query.all()
    courses_list = []
    for course in courses_query:
        courses_list.append({
            "course": course.course_name,
            "teacher": course.teacher,
            "time": course.time,
            "enrolled": course.enrolled,
            "add": course.add_status or "+"  # Use default "+" if null
        })
    
    # Get grades from database
    grades_query = StudentGrade.query.all()
    grades = {}
    for grade in grades_query:
        if grade.course_name not in grades:
            grades[grade.course_name] = []
        
        grades[grade.course_name].append({
            "name": grade.student_name,
            "grade": grade.grade
        })
    
    return jsonify({
        'users': users,
        'courses': courses_list,
        'student_grades': grades
    }), 200

# Add/update user endpoint for admin
@app.route('/api/admin/users', methods=['POST', 'OPTIONS'])
def admin_update_user():
    if request.method == 'OPTIONS':
        return handle_options_request()
        
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')
    
    if not username or not role:
        return jsonify({"message": "Username and role are required"}), 400
    
    # Check if user exists
    user = User.query.filter_by(username=username).first()
    
    if user:
        # Update existing user
        if password:
            user.password = password
        user.role = role
    else:
        # Create new user
        user = User(
            username=username,
            password=password or "123456",  # Default password
            role=role
        )
        db.session.add(user)
    
    db.session.commit()
    
    return jsonify({"message": f"User {username} saved successfully"}), 200

# Add/update course endpoint for admin
@app.route('/api/admin/courses', methods=['POST', 'OPTIONS'])
def admin_update_course():
    if request.method == 'OPTIONS':
        return handle_options_request()
        
    data = request.get_json()
    course_name = data.get('course')
    teacher = data.get('teacher')
    time = data.get('time')
    enrolled = data.get('enrolled')
    add_status = data.get('add')
    
    if not course_name or not teacher or not time or not enrolled:
        return jsonify({"message": "Course name, teacher, time, and enrollment are required"}), 400
    
    # Check if course exists
    course = Course.query.filter_by(course_name=course_name).first()
    
    if course:
        # Update existing course
        course.teacher = teacher
        course.time = time
        course.enrolled = enrolled
        if add_status is not None:
            course.add_status = add_status
    else:
        # Create new course
        course = Course(
            course_name=course_name,
            teacher=teacher,
            time=time,
            enrolled=enrolled,
            add_status=add_status or "+"  # Default to available
        )
        db.session.add(course)
    
    db.session.commit()
    
    return jsonify({"message": f"Course {course_name} saved successfully"}), 200

# Add/update grade endpoint for admin
@app.route('/api/admin/grades', methods=['POST', 'OPTIONS'])
def admin_update_grade():
    if request.method == 'OPTIONS':
        return handle_options_request()
        
    data = request.get_json()
    course_name = data.get('course')
    student_name = data.get('student')
    grade_value = data.get('grade')
    
    if not course_name or not student_name or not grade_value:
        return jsonify({"message": "Course name, student name, and grade are required"}), 400
    
    # Check if grade exists
    grade = StudentGrade.query.filter_by(
        course_name=course_name,
        student_name=student_name
    ).first()
    
    if grade:
        # Update existing grade
        grade.grade = grade_value
    else:
        # Create new grade
        grade = StudentGrade(
            course_name=course_name,
            student_name=student_name,
            grade=grade_value
        )
        db.session.add(grade)
    
    db.session.commit()
    
    return jsonify({"message": f"Grade for {student_name} in {course_name} saved successfully"}), 200

# Helper function for OPTIONS requests (CORS preflight)
def handle_options_request():
    response = jsonify({})
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response, 200

if __name__ == '__main__':
    initialize_db()
    app.run(debug=True)