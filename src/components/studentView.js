import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import '../App.css';

// Row for enrolled courses
const Row = ({ course, teacher, time, enrolled }) => (
  <tr>
    <td>{course}</td>
    <td>{teacher}</td>
    <td>{time}</td>
    <td>{enrolled}</td>
  </tr>
);

// Row for available courses
const AddRow = ({ course, teacher, time, enrolled, add, onSignup }) => (
  <tr>
    <td>{course}</td>
    <td>{teacher}</td>
    <td>{time}</td>
    <td>{enrolled}</td>
    <td>
      {add === '+' ? (
        <button onClick={() => onSignup(course)}>Add</button>
      ) : (
        add
      )}
    </td>
  </tr>
);

// Table for enrolled courses
const CourseTable = ({ data }) => (
  <table>
    <thead>
      <tr>
        <th>Course</th>
        <th>Teacher</th>
        <th>Time</th>
        <th>Enrolled</th>
      </tr>
    </thead>
    <tbody>
      {data.map((course, index) => (
        <Row key={index} {...course} />
      ))}
    </tbody>
  </table>
);

// Table for addable courses
const AddCourseTable = ({ data, onSignup }) => (
  <table>
    <thead>
      <tr>
        <th>Course</th>
        <th>Teacher</th>
        <th>Time</th>
        <th>Enrolled</th>
        <th>Add</th>
      </tr>
    </thead>
    <tbody>
      {data.map((course, index) => (
        <AddRow key={index} {...course} onSignup={onSignup} />
      ))}
    </tbody>
  </table>
);

export default function StudentView() {
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [showMyCourses, setShowMyCourses] = useState(true);
  const [message, setMessage] = useState('');

  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');

  // Redirect if not a student
  useEffect(() => {
    if (role !== 'student') {
      navigate('/login');
    }
  }, [role, navigate]);

  useEffect(() => {
    const url = showMyCourses
      ? 'http://localhost:5000/api/student/courses'
      : 'http://localhost:5000/api/school/courses';

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (showMyCourses) setEnrolledCourses(data);
        else setAvailableCourses(data);
      })
      .catch((err) => console.error('Error:', err));
  }, [showMyCourses]);

  const handleSignup = async (courseName) => {
    try {
      const res = await fetch('http://localhost:5000/api/student/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course: courseName }),
      });
      const data = await res.json();
      setMessage(data.message);

      // Refresh course views
      if (res.ok) {
        setShowMyCourses(true); // switch to enrolled view
      }
    } catch (err) {
      console.error(err);
      setMessage('Signup failed');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
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
          <h1 id="s-out-in" onClick={handleLogout} style={{ cursor: 'pointer' }}>
            Sign out <FaSignOutAlt />
          </h1>
        </div>

        <div className="content-container">
          <div className="course-view">
            <p
              onClick={() => setShowMyCourses(true)}
              style={{ backgroundColor: showMyCourses ? '#f5f5f5' : 'white' }}
              className="px-4 py-2 rounded-lg font-medium"
            >
              My Courses
            </p>
            <p
              onClick={() => setShowMyCourses(false)}
              style={{ backgroundColor: !showMyCourses ? '#f5f5f5' : 'white' }}
              className="px-4 py-2 rounded-lg font-medium"
            >
              Add Courses
            </p>
          </div>

          {message && <p>{message}</p>}

          {showMyCourses ? (
            <CourseTable data={enrolledCourses} />
          ) : (
            <AddCourseTable data={availableCourses} onSignup={handleSignup} />
          )}
        </div>
      </div>
    </div>
  );
}
