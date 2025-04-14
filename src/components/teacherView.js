import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSignOutAlt, FaArrowAltCircleLeft } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";

const courses = [
    {course: 'Physics 009', teacher: 'Susan B', time: 'TR 11:00-11:50 AM', enrolled: '5/10'},
    {course: 'Physics 008', teacher: 'Susan B', time: 'TR 11:00-11:50 AM', enrolled: '6/10'}  
];
      
const studentList = [
    {name: 'student 1', grade: '92'}, 
    {name: 'student 2', grade: '94'}, 
    {name: 'student 3', grade: '87'}, 
]; 

function TeacherView() {
    const [rows, setRows] = useState(courses);
    const [infoRows, setInfoRows] = useState(studentList);
    const [showCourseView, setShowCourseView] = useState(true);
    const [currentCourse, setCurrentCourse] = useState('');

    // modal 
    const [stuName, setStuName] = useState(''); 
    const [modal, setModal] = useState(true); 
      
    const name = 'Teacher Name'; 
    
    const StudentTable = (props) => {
        const {data, onStudentClick, onEditClick} = props;
        return (
            <table>
                <thead>
                    <tr>
                        <th className = "table-row-content">Student Name</th>
                        <th className = "table-row-content">Grade</th>
                        <th id = "edit-grade" className = "table-row-content">Edit</th>
                    </tr>
                </thead> 
                <tbody>
                    {data.map((row, index) => (
                        <InfoRow
                            key={index}
                            name={row.name}
                            grade={row.grade}
                            onStudentClick={onStudentClick}
                            onEditClick={onEditClick}
                        />
                    ))}
                </tbody>
            </table>
        );
    }
    
    const CourseTable = (props) => {
        const {data, onCourseClick} = props;
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
                            onClick={() => onCourseClick(row.course)}
                        />
                    ))}
                </tbody>
            </table>
        );
    }

    const Row = (props) => {
        const {course, teacher, time, enrolled, onClick} = props;
        return (
            <tr className="table-row">
                <td style={{ textDecoration: 'underline', cursor: 'pointer'}}
                    onClick={() => onClick(course)}>{course}
                </td> 
                <td>{teacher}</td>
                <td>{time}</td>
                <td>{enrolled}</td>
            </tr>
        );
    }
    
    const InfoRow = (props) => {
        const {name, grade, onStudentClick, onEditClick} = props;
        return (
            <tr className="table-row">
                <td onClick={() => onStudentClick(name)}>{name}</td>
                <td>{grade}</td>
                <td>
                    <FaPencil 
                        style={{ cursor: 'pointer', color: '#90EE90'}}
                        onClick={() => onEditClick(name)}
                    />
                </td>
            </tr>
        );
    };
    
    const handleCourseClick = (courseName) => {
        setCurrentCourse(courseName);
        setShowCourseView(false);
    };

    const handleEditClick = (studentName) => {
        console.log(`Editing student: ${studentName}`);
        
    };

    return (
        <div className="app-container">
            <div id="course-container">
                <div id="top-bar">
                    <h1 id="welcome">Welcome {name}</h1>
                    <div className="img-container">
                        <img id = "logo" src = "https://nationalnutgrower.com/wp-content/uploads/2024/03/UC-Merced-logo-rectangle-1024x262.png"></img>
                    </div>
                    <Link id="s-out" to="/">
                        <h1 id="s-out-in">Sign out <FaSignOutAlt/></h1>
                    </Link>
                </div>

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
                                    style = {{cursor: 'pointer'}}
                                    id="arrow" 
                                    onClick={() => setShowCourseView(true)}
                                /> 
                            <p className="t-course-title">{currentCourse}</p>
                            <span></span>
                        </div>
                        <StudentTable 
                            data={infoRows} 
                            onStudentClick={() => {}} 
                            onEditClick={handleEditClick}
                        />
                    </div>
                )}
            </div>
            
            {/* change grade modal */}
            {/* <div className = 'grade-modal'>
                <div className = 'e-title'>
                    <h2>EDIT GRADE</h2>
                </div>
                <div className = 'e-info'>
                    <h3 id = "e-student-name">Student {stuName} name</h3>
                    <input placeholder='92' id = "e-grade-input"></input>
                </div>
                <button id = "sub-btn" >Submit</button>
                
            </div> */}


        </div>
    );
}

export default TeacherView;