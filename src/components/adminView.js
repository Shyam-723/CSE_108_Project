import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSignOutAlt, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import '../App.css';

function AdminView() {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState({});
    const [courses, setCourses] = useState([]);
    const [studentGrades, setStudentGrades] = useState({});
    const [message, setMessage] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({});
    const [formType, setFormType] = useState('');
    const [formAction, setFormAction] = useState('add');

    // Load admin data on component mount
    useEffect(() => {
        fetchAdminData();
    }, []);

    // Function to fetch data from the backend
    const fetchAdminData = () => {
        fetch('http://localhost:5000/api/admin/data')
            .then(res => res.json())
            .then(data => {
                setUsers(data.users);
                setCourses(data.courses);
                setStudentGrades(data.student_grades);
            })
            .catch(err => {
                console.error('Error fetching admin data:', err);
                setMessage('Error loading data. Please try again.');
            });
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // In a real app, you would send this data to the backend
        // For simplicity, we'll just update the local state
        
        if (formAction === 'add') {
            if (formType === 'user') {
                const newUsers = {...users};
                newUsers[formData.username] = {
                    password: formData.password || '123456',
                    role: formData.role || 'student'
                };
                setUsers(newUsers);
            } else if (formType === 'course') {
                const newCourse = {
                    course: formData.course,
                    teacher: formData.teacher,
                    time: formData.time,
                    enrolled: formData.enrolled,
                    add: formData.add || '+'
                };
                setCourses([...courses, newCourse]);
            } else if (formType === 'grade') {
                const courseGrades = studentGrades[formData.course] || [];
                const newGrade = {
                    name: formData.student,
                    grade: formData.grade
                };
                
                const updatedGrades = {...studentGrades};
                updatedGrades[formData.course] = [...courseGrades, newGrade];
                setStudentGrades(updatedGrades);
            }
        } else if (formAction === 'edit') {
            // Handle edit actions (in a real app, would update the backend)
            if (formType === 'user') {
                const updatedUsers = {...users};
                updatedUsers[formData.username] = {
                    password: formData.password || updatedUsers[formData.username].password,
                    role: formData.role || updatedUsers[formData.username].role
                };
                setUsers(updatedUsers);
            } else if (formType === 'course') {
                const updatedCourses = courses.map(course => 
                    course.course === formData.originalCourse ? 
                    {
                        course: formData.course,
                        teacher: formData.teacher,
                        time: formData.time,
                        enrolled: formData.enrolled,
                        add: formData.add
                    } : course
                );
                setCourses(updatedCourses);
            } else if (formType === 'grade') {
                const updatedGrades = {...studentGrades};
                const courseGrades = updatedGrades[formData.course] || [];
                
                updatedGrades[formData.course] = courseGrades.map(student => 
                    student.name === formData.originalStudent ? 
                    {
                        name: formData.student,
                        grade: formData.grade
                    } : student
                );
                
                setStudentGrades(updatedGrades);
            }
        }
        
        setMessage(`${formAction === 'add' ? 'Added' : 'Updated'} ${formType} successfully!`);
        setShowForm(false);
        setFormData({});
    };

    // Open form for adding a new item
    const handleAdd = (type) => {
        setFormType(type);
        setFormAction('add');
        setFormData({});
        setShowForm(true);
    };

    // Open form for editing an existing item
    const handleEdit = (type, item) => {
        setFormType(type);
        setFormAction('edit');
        
        if (type === 'user') {
            setFormData({
                username: item,
                password: '',  // Don't show existing password
                role: users[item].role
            });
        } else if (type === 'course') {
            setFormData({
                originalCourse: item.course,
                course: item.course,
                teacher: item.teacher,
                time: item.time,
                enrolled: item.enrolled,
                add: item.add
            });
        } else if (type === 'grade') {
            setFormData({
                course: item.course,
                originalStudent: item.name,
                student: item.name,
                grade: item.grade
            });
        }
        
        setShowForm(true);
    };

    // Handle delete actions
    const handleDelete = (type, id) => {
        if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
            if (type === 'user') {
                const newUsers = {...users};
                delete newUsers[id];
                setUsers(newUsers);
            } else if (type === 'course') {
                setCourses(courses.filter(course => course.course !== id));
            } else if (type === 'grade') {
                const [courseName, studentName] = id.split('|');
                const newGrades = {...studentGrades};
                newGrades[courseName] = newGrades[courseName].filter(
                    student => student.name !== studentName
                );
                setStudentGrades(newGrades);
            }
            
            setMessage(`${type} deleted successfully!`);
        }
    };

    // Clear message after 3 seconds
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    // Render form based on type
    const renderForm = () => {
        if (!showForm) return null;
        
        let form;
        
        switch(formType) {
            case 'user':
                form = (
                    <>
                        <h2>{formAction === 'add' ? 'Add New User' : 'Edit User'}</h2>
                        <div className="form-group">
                            <label>Username:</label>
                            <input 
                                type="text" 
                                name="username" 
                                value={formData.username || ''} 
                                onChange={handleInputChange}
                                disabled={formAction === 'edit'}
                            />
                        </div>
                        <div className="form-group">
                            <label>Password:</label>
                            <input 
                                type="password" 
                                name="password" 
                                value={formData.password || ''} 
                                onChange={handleInputChange}
                                placeholder={formAction === 'edit' ? "Leave blank to keep current" : ""}
                            />
                        </div>
                        <div className="form-group">
                            <label>Role:</label>
                            <select 
                                name="role" 
                                value={formData.role || 'student'} 
                                onChange={handleInputChange}
                            >
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </>
                );
                break;
                
            case 'course':
                form = (
                    <>
                        <h2>{formAction === 'add' ? 'Add New Course' : 'Edit Course'}</h2>
                        <div className="form-group">
                            <label>Course Name:</label>
                            <input 
                                type="text" 
                                name="course" 
                                value={formData.course || ''} 
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Teacher:</label>
                            <input 
                                type="text" 
                                name="teacher" 
                                value={formData.teacher || ''} 
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Time:</label>
                            <input 
                                type="text" 
                                name="time" 
                                value={formData.time || ''} 
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Enrollment:</label>
                            <input 
                                type="text" 
                                name="enrolled" 
                                value={formData.enrolled || ''} 
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Availability Status:</label>
                            <select 
                                name="add" 
                                value={formData.add || '+'} 
                                onChange={handleInputChange}
                            >
                                <option value="+">Available (+)</option>
                                <option value="-">Not Available (-)</option>
                            </select>
                        </div>
                    </>
                );
                break;
                
            case 'grade':
                form = (
                    <>
                        <h2>{formAction === 'add' ? 'Add New Grade' : 'Edit Grade'}</h2>
                        <div className="form-group">
                            <label>Course:</label>
                            <select 
                                name="course" 
                                value={formData.course || ''} 
                                onChange={handleInputChange}
                                disabled={formAction === 'edit'}
                            >
                                <option value="">Select Course</option>
                                {Object.keys(studentGrades).map(course => (
                                    <option key={course} value={course}>{course}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Student Name:</label>
                            <input 
                                type="text" 
                                name="student" 
                                value={formData.student || ''} 
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Grade:</label>
                            <input 
                                type="text" 
                                name="grade" 
                                value={formData.grade || ''} 
                                onChange={handleInputChange}
                            />
                        </div>
                    </>
                );
                break;
                
            default:
                form = <p>Unknown form type</p>;
        }
        
        return (
            <div className="modal-overlay">
                <div className="form-modal">
                    <form onSubmit={handleSubmit}>
                        {form}
                        <div className="form-actions">
                            <button type="submit" className="submit-btn">
                                {formAction === 'add' ? 'Add' : 'Update'}
                            </button>
                            <button 
                                type="button" 
                                className="cancel-btn"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="app-container">
            <div id="course-container">
                <div id="top-bar">
                    <h1 id="welcome">Admin Dashboard</h1>
                    <div className="img-container">
                        <img
                            id="logo"
                            src="https://nationalnutgrower.com/wp-content/uploads/2024/03/UC-Merced-logo-rectangle-1024x262.png"
                            alt="UC Merced Logo"
                        />
                    </div>
                    <Link id="s-out" to="/login">
                        <h1 id="s-out-in">
                            Sign out <FaSignOutAlt />
                        </h1>
                    </Link>
                </div>

                {message && <p className="message">{message}</p>}

                <div className="admin-tabs">
                    <button 
                        className={activeTab === 'users' ? 'active' : ''} 
                        onClick={() => setActiveTab('users')}
                    >
                        Users
                    </button>
                    <button 
                        className={activeTab === 'courses' ? 'active' : ''} 
                        onClick={() => setActiveTab('courses')}
                    >
                        Courses
                    </button>
                    <button 
                        className={activeTab === 'grades' ? 'active' : ''} 
                        onClick={() => setActiveTab('grades')}
                    >
                        Grades
                    </button>
                </div>

                <div className="admin-content">
                    {activeTab === 'users' && (
                        <div className="data-section">
                            <div className="section-header">
                                <h2>Users</h2>
                                <button 
                                    className="add-btn"
                                    onClick={() => handleAdd('user')}
                                >
                                    <FaPlus /> Add User
                                </button>
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Role</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(users).map(([username, data]) => (
                                        <tr key={username} className="table-row">
                                            <td>{username}</td>
                                            <td>{data.role}</td>
                                            <td className="actions">
                                                <button 
                                                    className="edit-btn"
                                                    onClick={() => handleEdit('user', username)}
                                                    title="Edit user"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button 
                                                    className="delete-btn"
                                                    onClick={() => handleDelete('user', username)}
                                                    title="Delete user"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'courses' && (
                        <div className="data-section">
                            <div className="section-header">
                                <h2>Courses</h2>
                                <button 
                                    className="add-btn"
                                    onClick={() => handleAdd('course')}
                                >
                                    <FaPlus /> Add Course
                                </button>
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Course Name</th>
                                        <th>Teacher</th>
                                        <th>Time</th>
                                        <th>Enrollment</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courses.map((course, index) => (
                                        <tr key={index} className="table-row">
                                            <td>{course.course}</td>
                                            <td>{course.teacher}</td>
                                            <td>{course.time}</td>
                                            <td>{course.enrolled}</td>
                                            <td>{course.add === '+' ? 'Available' : 'Enrolled'}</td>
                                            <td className="actions">
                                                <button 
                                                    className="edit-btn"
                                                    onClick={() => handleEdit('course', course)}
                                                    title="Edit course"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button 
                                                    className="delete-btn"
                                                    onClick={() => handleDelete('course', course.course)}
                                                    title="Delete course"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'grades' && (
                        <div className="data-section">
                            <div className="section-header">
                                <h2>Student Grades</h2>
                                <button 
                                    className="add-btn"
                                    onClick={() => handleAdd('grade')}
                                >
                                    <FaPlus /> Add Grade
                                </button>
                            </div>
                            {Object.entries(studentGrades).map(([courseName, students]) => (
                                <div key={courseName} className="course-grades">
                                    <h3>{courseName}</h3>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Student Name</th>
                                                <th>Grade</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.map((student, index) => (
                                                <tr key={index} className="table-row">
                                                    <td>{student.name}</td>
                                                    <td>{student.grade}</td>
                                                    <td className="actions">
                                                        <button 
                                                            className="edit-btn"
                                                            onClick={() => handleEdit('grade', {
                                                                course: courseName,
                                                                ...student
                                                            })}
                                                            title="Edit grade"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button 
                                                            className="delete-btn"
                                                            onClick={() => handleDelete('grade', `${courseName}|${student.name}`)}
                                                            title="Delete grade"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            {renderForm()}
        </div>
    );
}

export default AdminView;