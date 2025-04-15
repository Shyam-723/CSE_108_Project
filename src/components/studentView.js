import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaPlus, FaMinus } from 'react-icons/fa';
import { AppContext } from '../App';
import '../App.css';

const Row = ({ course, teacher, time, enrolled, onDrop }) => (
  <tr className="table-row">
    <td>{course}</td>
    <td>{teacher}</td>
    <td>{time}</td>
    <td>{enrolled}</td>
    <td>
      <FaMinus
        style={{
          cursor: 'pointer',
          color: 'red',
        }}
        onClick={() => onDrop(course)}
      />
    </td>
  </tr>
);

const AddRow = ({ course, teacher, time, enrolled, add, onSignup }) => (
  <tr className="table-row">
    <td>{course}</td>
    <td>{teacher}</td>
    <td>{time}</td>
    <td>{enrolled}</td>
    <td>
      {add === '+' ? (
        <FaPlus
          style={{
            cursor: 'pointer',
            color: 'green',
          }}
          onClick={() => onSignup(course)}
        />
      ) : (
        <span style={{ color: 'gray' }}>-</span>
      )}
    </td>
  </tr>
);

const CourseTable = ({ data, onDrop }) => (
  <table>
    <thead>
      <tr>
        <th>Course Name</th>
        <th>Teacher</th>
        <th>Time</th>
        <th>Enrollment</th>
        <th>Drop Course</th>
      </tr>
    </thead>
    <tbody>
      {data.length > 0 ? (
        data.map((row, index) => (
          <Row
            key={index}
            course={row.course}
            teacher={row.teacher}
            time={row.time}
            enrolled={row.enrolled}
            onDrop={onDrop}
          />
        ))
      ) : (
        <tr>
          <td colSpan="5" style={{ textAlign: 'center' }}>No courses enrolled</td>
        </tr>
      )}
    </tbody>
  </table>
);

const AddCourseTable = ({ data, onSignup }) => (
  <table>
    <thead>
      <tr>
        <th>Course Name</th>
        <th>Teacher</th>
        <th>Time</th>
        <th>Enrollment</th>
        <th>Add Course</th>
      </tr>
    </thead>
    <tbody>
      {data.length > 0 ? (
        data.map((row, index) => (
          <AddRow
            key={index}
            course={row.course}
            teacher={row.teacher}
            time={row.time}
            enrolled={row.enrolled}
            add={row.add}
            onSignup={onSignup}
          />
        ))
      ) : (
        <tr>
          <td colSpan="5" style={{ textAlign: 'center' }}>No courses available</td>
        </tr>
      )}
    </tbody>
  </table>
);

function StudentView() {
  const [rows, setRows] = useState([]);
  const [addRows, setAddRows] = useState([]);
  const [showCourseView, setShowCourseView] = useState(true);
  const [message, setMessage] = useState('');
  
  const { username, handleLogout } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Load initial data
    if (showCourseView) {
      fetchEnrolledCourses();
    } else {
      fetchSchoolCourses();
    }
  }, [showCourseView]);

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchEnrolledCourses = () => {
    fetch(`http://localhost:5000/api/student/courses?username=${username}`)
      .then((res) => res.json())
      .then((data) => setRows(data))
      .catch((err) => {
        console.error('Error fetching enrolled courses:', err);
        setMessage('Error loading courses. Please try again.');
      });
  };

  const fetchSchoolCourses = () => {
    fetch('http://localhost:5000/api/school/courses')
      .then((res) => res.json())
      .then((data) => setAddRows(data))
      .catch((err) => {
        console.error('Error fetching school courses:', err);
        setMessage('Error loading available courses. Please try again.');
      });
  };

  // Handler for signing up for a course
  const handleSignup = async (courseName) => {
    try {
      const response = await fetch('http://localhost:5000/api/student/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          course: courseName,
          username: username
        }),
      });
      const data = await response.json();
      setMessage(data.message);
      if (response.ok) {
        // Refresh course lists after successful signup
        fetchEnrolledCourses();
        fetchSchoolCourses();
      }
    } catch (error) {
      console.error('Error signing up for course:', error);
      setMessage('Error signing up for course. Please try again.');
    }
  };

  // Handler for dropping a course
  const handleDrop = async (courseName) => {
    try {
      const response = await fetch('http://localhost:5000/api/student/drop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          course: courseName,
          username: username
        }),
      });
      const data = await response.json();
      setMessage(data.message);
      if (response.ok) {
        // Refresh course lists after successful drop
        fetchEnrolledCourses();
        fetchSchoolCourses();
      }
    } catch (error) {
      console.error('Error dropping course:', error);
      setMessage('Error dropping course. Please try again.');
    }
  };

  // Handle logout
  const handleSignOut = () => {
    handleLogout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <div id="course-container">
        <div id="top-bar">
          <h1 id="welcome">Welcome {username}</h1>
          <div className="img-container">
            <img
              id="logo"
              src="https://nationalnutgrower.com/wp-content/uploads/2024/03/UC-Merced-logo-rectangle-1024x262.png"
              alt="UC Merced Logo"
            />
          </div>
          <button id="s-out" onClick={handleSignOut}>
            <h1 id="s-out-in">
              Sign out <FaSignOutAlt />
            </h1>
          </button>
        </div>

        {message && <p className="message">{message}</p>}

        <div className="content-container">
          <div className="course-view">
            <p
              onClick={() => setShowCourseView(true)}
              style={
                showCourseView
                  ? { backgroundColor: '#f5f5f5' }
                  : { backgroundColor: 'white' }
              }
            >
              My Courses
            </p>
            <p
              onClick={() => setShowCourseView(false)}
              style={
                !showCourseView
                  ? { backgroundColor: '#f5f5f5' }
                  : { backgroundColor: 'white' }
              }
            >
              Add Course
            </p>
          </div>

          {showCourseView ? (
            <div id="stu-courses">
              <div id="course-section">
                <CourseTable data={rows} onDrop={handleDrop} />
              </div>
            </div>
          ) : (
            <div id="add-courses">
              <div id="course-section">
                <AddCourseTable data={addRows} onSignup={handleSignup} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentView;