import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSignOutAlt, FaArrowAltCircleLeft } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";



function TeacherView() {
    const [rows, setRows] = useState([]);

    useEffect(() => {
        const teacherName = localStorage.getItem('displayName');
      
        fetch('http://localhost:5000/api/teacher/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: teacherName })
        })
          .then((res) => res.json())
          .then((data) => setRows(data))
          .catch((err) => console.error('Failed to load courses', err));
      }, []);
      

      const [infoRows, setInfoRows] = useState([]);
    const [showCourseView, setShowCourseView] = useState(true);
    const [currentCourse, setCurrentCourse] = useState('');

    // modal 
    const [stuName, setStuName] = useState(''); 
    const [stuGrade, setStuGrade] = useState(''); 
    const [modal, setModal] = useState(false); 
      
    const name = localStorage.getItem('displayName') || 'Teacher';
    
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
                            onEditClick={handleOpenEditModal}
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
                <td style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer'}}
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
                        onClick={() => onEditClick(name, grade)}    
                    />
                </td>
            </tr>
        );
    };
    
    const handleCourseClick = async (courseName) => {
        setCurrentCourse(courseName);
        setShowCourseView(false);
      
        try {
          const res = await fetch('http://localhost:5000/api/teacher/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ course: courseName }),
          });
      
          const data = await res.json();
          setInfoRows(data);
        } catch (err) {
          console.error('Error fetching students for course:', err);
        }
      };
      

    const handleOpenEditModal = (studentName, studentGrade) => {
        console.log(`Editing student: ${studentName}`);
        setStuName(studentName);
        setStuGrade(studentGrade); 
        setModal(true); 
        
    }; 

    const editGrade = (e) => {
        handleCloseEditModal(); 
    }; 

    const handleCloseEditModal = () => { 
        setModal(false); 
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
                            onEditClick={handleOpenEditModal}
                        />
                    </div>
                )}
            </div>
            
            {/* change grade modal */}

            {/* Modal with overlay */}
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