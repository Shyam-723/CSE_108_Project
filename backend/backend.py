from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///school.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    display_name = db.Column(db.String(100))

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    course = db.Column(db.String(100), nullable=False)
    teacher = db.Column(db.String(100), nullable=False)
    time = db.Column(db.String(100))
    capacity = db.Column(db.Integer, default=30)

class StudentEnrollment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'))
    student_name = db.Column(db.String(100), nullable=False)
    grade = db.Column(db.Integer)

# Predefined users, passwords, and roles
# USERS = {
#     "student": {"password": "123456", "role": "student"},
#     "susan": {"password": "123456", "role": "teacher", "name": "Susan B"},
#     "mr.b": {"password": "123456", "role": "teacher", "name": "Mr.B"},
#     "admin": {"password": "123456", "role": "admin"}
# }

# # Static course data (in a real app you might store these in the database)
# courses = [
#     {"course": "Physics 009", "teacher": "Susan B", "time": "TR 11:00-11:50 AM", "enrolled": "25/40"},
#     {"course": "Math 131", "teacher": "Mr.B", "time": "TR 11:00-11:50 AM", "enrolled": "30/30"},
#     {"course": "CSE 120", "teacher": "Susan B", "time": "TR 11:00-11:50 AM", "enrolled": "18/20"}
# ]

# # School course offerings with an 'add' flag.
# addCourse = [
#     {"course": "Cogs 97", "teacher": "Susan B", "time": "TR 11:00-11:50 AM", "enrolled": "15/15", "add": "-"},
#     {"course": "Math 141", "teacher": "Mr.B", "time": "TR 11:00-11:50 AM", "enrolled": "30/45", "add": "+"},
#     {"course": "CSE 110", "teacher": "Susan B", "time": "TR 11:00-11:50 AM", "enrolled": "25/40", "add": "+"}
# ]

# course_students = {
#     "Physics 009": [{"name": "Alice", "grade": 88}, {"name": "Bob", "grade": 91}, {"name": "Carmen", "grade": 82}, {"name": "David", "grade": 95}, {"name": "Emily", "grade": 77}],
#     "Math 131": [{"name": "Frank", "grade": 90}, {"name": "Grace", "grade": 93}, {"name": "Hannah", "grade": 85}, {"name": "Ivan", "grade": 89}, {"name": "Jake", "grade": 92}, {"name": "Laura", "grade": 88}],
#     "CSE 120": [{"name": "Nina", "grade": 97}, {"name": "Oscar", "grade": 84}, {"name": "Pam", "grade": 90}, {"name": "Quentin", "grade": 76}]
# }


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data.get('username')).first()

    if not user or user.password != data.get('password'):
        return jsonify({'message': 'Username or Password incorrect'}), 401

    return jsonify({
        'message': f"Welcome {user.username}",
        'role': user.role,
        'displayName': user.display_name or user.username
    }), 200


@app.route('/api/teacher/courses', methods=['GET', 'POST'])
def get_teacher_courses():
    if request.method == 'POST':
        data = request.get_json()
        teacher_name = data.get('name')
        teacher_courses = Course.query.filter_by(teacher=teacher_name).all()
    else:
        teacher_courses = Course.query.all()

    output = []
    for course in teacher_courses:
        enrolled = StudentEnrollment.query.filter_by(course_id=course.id).count()
        output.append({
            "course": course.course,
            "teacher": course.teacher,
            "time": course.time,
            "enrolled": f"{enrolled}/{course.capacity}"
        })
    return jsonify(output), 200


@app.route('/api/teacher/students', methods=['POST'])
def get_students_for_course():
    data = request.get_json()
    course = Course.query.filter_by(course=data.get('course')).first()
    if not course:
        return jsonify([]), 200

    enrollments = StudentEnrollment.query.filter_by(course_id=course.id).all()
    students = [{"name": e.student_name, "grade": e.grade} for e in enrollments]
    return jsonify(students), 200



# Endpoint to get all school courses offered
@app.route('/api/school/courses', methods=['GET'])
def get_school_courses():
    output = []
    all_courses = Course.query.all()
    for course in all_courses:
        enrolled = StudentEnrollment.query.filter_by(course_id=course.id).count()
        output.append({
            "course": course.course,
            "teacher": course.teacher,
            "time": course.time,
            "enrolled": f"{enrolled}/{course.capacity}",
            "add": "+" if enrolled < course.capacity else "-"
        })
    return jsonify(output), 200


# Endpoint for course signup: expects a JSON with a course name.
@app.route('/api/student/signup', methods=['POST'])
def signup_course():
    data = request.get_json()
    course = Course.query.filter_by(course=data.get('course')).first()

    if not course:
        return jsonify({'message': 'Course not found'}), 404

    enrolled = StudentEnrollment.query.filter_by(course_id=course.id).count()
    if enrolled >= course.capacity:
        return jsonify({'message': 'Course is full'}), 400

    # Add student (fake name "student" for demo)
    new_enrollment = StudentEnrollment(
        course_id=course.id,
        student_name = data.get('student_name', 'student'),
        grade=0
    )
    db.session.add(new_enrollment)
    db.session.commit()

    return jsonify({'message': f"Successfully signed up for {course.course}"}), 200



@app.route('/api/student/drop', methods=['POST'])
def drop_course():
    data = request.get_json()
    course = Course.query.filter_by(course=data.get('course')).first()
    if not course:
        return jsonify({'message': 'Course not found'}), 404

    enrollment = StudentEnrollment.query.filter_by(course_id=course.id, student_name = data.get('student_name', 'student')).first()
    if enrollment:
        db.session.delete(enrollment)
        db.session.commit()
        return jsonify({'message': f"Dropped {course.course}"}), 200

    return jsonify({'message': 'Not enrolled in that course'}), 400


@app.route('/api/admin/courses', methods=['GET'])
def admin_get_courses():
    output = []
    all_courses = Course.query.all()
    for course in all_courses:
        enrolled = StudentEnrollment.query.filter_by(course_id=course.id).count()
        output.append({
            "course": course.course,
            "teacher": course.teacher,
            "time": course.time,
            "enrolled": f"{enrolled}/{course.capacity}"
        })
    return jsonify(output), 200

@app.route('/api/admin/students', methods=['POST'])
def admin_get_students():
    data = request.get_json()
    course = Course.query.filter_by(course=data.get('course')).first()
    if not course:
        return jsonify([]), 200

    enrollments = StudentEnrollment.query.filter_by(course_id=course.id).all()
    students = [{"name": e.student_name, "grade": e.grade} for e in enrollments]
    return jsonify(students), 200


@app.route('/api/admin/add_course', methods=['POST'])
def admin_add_course():
    data = request.get_json()
    new_course = Course(
        course=data.get('course'),
        teacher=data.get('teacher'),
        time=data.get('time'),
        capacity=data.get('max', 30)
    )
    db.session.add(new_course)
    db.session.commit()
    return jsonify({'message': f"Course {new_course.course} added"}), 200


@app.route('/api/admin/delete_course', methods=['DELETE'])
def admin_delete_course():
    data = request.get_json()
    course = Course.query.filter_by(course=data.get('course')).first()
    if course:
        # Delete enrollments first
        StudentEnrollment.query.filter_by(course_id=course.id).delete()
        db.session.delete(course)
        db.session.commit()
        return jsonify({'message': f"Course {course.course} deleted"}), 200
    return jsonify({'message': 'Course not found'}), 404

if __name__ == '__main__':
    with app.app_context():
        db.create_all()

        if not User.query.first():
            users = [...]
            courses = [...]
            db.session.add_all(users + courses)
            db.session.commit()
            
        from random import randint
        from faker import Faker

        fake = Faker()

        existing_courses = Course.query.all()
        for course in existing_courses:
            current_enrolled = StudentEnrollment.query.filter_by(course_id=course.id).count()
            spots_left = course.capacity - current_enrolled

            for _ in range(spots_left // 2):  # Add 50% of capacity
                fake_name = fake.first_name()
                fake_grade = randint(65, 100)
                enrollment = StudentEnrollment(
                    course_id=course.id,
                    student_name=fake_name,
                    grade=fake_grade
                )
                db.session.add(enrollment)

        db.session.commit()
        print("✅ Fake student enrollments added.")

    app.run(debug=True)

