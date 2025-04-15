import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaSignOutAlt, FaArrowAltCircleLeft } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";

function TeacherView() {
    const [rows, setRows] = useState([]);
    const [infoRows, setInfoRows] = useState([]);
    const [showCourseView, setShowCourseView] = useState(true);
    const [currentCourse, setCurrentCourse] = useState('');
    const [message, setMessage] = useState('');
    const [teacherName, setTeacherName] = useState('');

    // modal stuff
    const [stuName, setStuName] = useState(''); 
    const [stuGrade, setStuGrade] = useState(''); 
    const [modal, setModal] = useState(false);
    
    // Get username from location state if available
    const location = useLocation();
    const username = location.state?.username || 'teacher'; // Default to 'teacher' if not provided
    
    useEffect(() => {
        // Set the teacher name
        setTeacherName(username);
        
        // Fetch teacher courses
        fetchTeacherCourses();
    }, [username]);

    // Clear message after 3 seconds
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const fetchTeacherCourses = () => {
        fetch(`http://localhost:5000/api/teacher/courses?username=${username}`)
            .then(res => res.json())
            .then(data => setRows(data))
            .catch(err => {
                console.error('Error fetching teacher courses:', err);
                setMessage('Error loading courses. Please try again.');
            });
    };

    const fetchCourseStudents = (courseName) => {
        fetch(`http://localhost:5000/api/teacher/students/${courseName}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setInfoRows(data);
                } else {
                    // Handle case where API returns an error message
                    setMessage(data.message || 'No students found for this course.');
                    setInfoRows([]);
                }
            })
            .catch(err => {
                console.error('Error fetching course students:', err);
                setMessage('Error loading students. Please try again.');
            });
    };

    const StudentTable = (props) => {
        const {data, onStudentClick, onEditClick} = props;
        
        if (data.length === 0) {
            return <p>No students found for this course.</p>;
        }
        
        return (
            <table>
                <thead>
                    <tr>
                        <th className="table-row-content">Student Name</th>
                        <th className="table-row-content">Grade</th>
                        <th id="edit-grade" className="table-row-content">Edit</th>
                    </tr>
                </thead> 
                <tbody>
                    {data.map((row, index) => (
                        <InfoRow
                            key={index}
                            name={row.name}
                            grade={row.grade}
                            onStudentClick={onStudentClick}
                            onEditClick={handleOpenEditModal}
                        />
                    ))}
                </tbody>
            </table>
        );
    }
    
    const CourseTable = (props) => {
        const {data, onCourseClick} = props;
        
        if (data.length === 0) {
            return <p>No courses found. Please contact an administrator.</p>;
        }
        
        return (
            <table>
                <thead>
                    <tr>
                        <th>Course Name</th>
                        <th>Teacher</th>
                        <th>Time</th>
                        <th>Enrollment</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <Row 
                            key={index}
                            course={row.course}
                            teacher={row.teacher}
                            time={row.time}
                            enrolled={row.enrolled}
                            onClick={onCourseClick}
                        />
                    ))}
                </tbody>
            </table>
        );
    }

    // ROW component 
    const Row = (props) => {
        const {course, teacher, time, enrolled, onClick} = props;
        return (
            <tr className="table-row">
                <td style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer'}}
                    onClick={() => onClick(course)}>{course}
                </td> 
                <td>{teacher}</td>
                <td>{time}</td>
                <td>{enrolled}</td>
            </tr>
        );
    }
    
    // student info row component
    const InfoRow = (props) => {
        const {name, grade, onStudentClick, onEditClick} = props;
        return (
            <tr className="table-row">
                <td onClick={() => onStudentClick(name)}>{name}</td>
                <td>{grade}</td>
                <td>
                    <FaPencil 
                        style={{ cursor: 'pointer', color: '#90EE90'}}
                        onClick={() => onEditClick(name, grade)}    
                    />
                </td>
            </tr>
        );
    };
    
    const handleCourseClick = (courseName) => {
        setCurrentCourse(courseName);
        fetchCourseStudents(courseName);
        setShowCourseView(false);
    };

    // open modal to edit a student's grade
    const handleOpenEditModal = (studentName, studentGrade) => {
        setStuName(studentName);
        setStuGrade(studentGrade); 
        setModal(true); 
    }; 

    // submit edited grade
    const editGrade = (e) => {
        e.preventDefault();
        
        // call API to update grade
        fetch('http://localhost:5000/api/teacher/update-grade', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                course: currentCourse,
                student: stuName,
                grade: stuGrade
            })
        })
        .then(res => res.json())
        .then(data => {
            setMessage(data.message);
            // Refresh student list
            fetchCourseStudents(currentCourse);
            handleCloseEditModal();
        })
        .catch(err => {
            console.error('Error updating grade:', err);
            setMessage('Error updating grade. Please try again.');
        });
    }; 

    // close edit modal
    const handleCloseEditModal = () => { 
        setModal(false); 
    }; 

    return (
        <div className="app-container">
            <div id="course-container">
                <div id="top-bar">
                    <h1 id="welcome">Welcome {teacherName}</h1>
                    <div className="img-container">
                        <img id="logo" src="https://nationalnutgrower.com/wp-content/uploads/2024/03/UC-Merced-logo-rectangle-1024x262.png" alt="UC Merced Logo"></img>
                    </div>
                    <Link id="s-out" to="/login">
                        <h1 id="s-out-in">Sign out <FaSignOutAlt/></h1>
                    </Link>
                </div>

                {message && <p className="message">{message}</p>}

                {showCourseView ? (
                    <div className="t-content-container">
                        <div className="t-course-view">
                            <p className="t-course-title">
                                Your Courses
                            </p>
                        </div>

                        <div id="t-courses">
                            <div id="course-section">
                                <CourseTable 
                                    data={rows}  
                                    onCourseClick={handleCourseClick} 
                                />
                            </div>
                        </div> 
                    </div>
                ) : (
                    <div className="student-info-container">
                        <div className="t-course-title-content">
                                <FaArrowAltCircleLeft 
                                    style={{cursor: 'pointer'}}
                                    id="arrow" 
                                    onClick={() => setShowCourseView(true)}
                                /> 
                            <p className="t-course-title">{currentCourse}</p>
                            <span></span>
                        </div>
                        <StudentTable 
                            data={infoRows} 
                            onStudentClick={() => {}} 
                            onEditClick={handleOpenEditModal}
                        />
                    </div>
                )}
            </div>
            
            {/* Modal for editing grades */}
            {modal && (
                <div className="modal-overlay" onClick={handleCloseEditModal}>
                    <div className="grade-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="e-title">
                            <h2>EDIT GRADE</h2>
                        </div>
                        <div className="e-info">
                            <h3 id="e-student-name">{stuName}</h3>
                            <input 
                                placeholder={stuGrade} 
                                id="e-grade-input"
                                value={stuGrade}
                                onChange={(e) => setStuGrade(e.target.value)}
                            ></input>
                        </div>
                        <button id="sub-btn" onClick={editGrade}>Submit</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TeacherView;