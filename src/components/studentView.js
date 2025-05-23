import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import '../App.css';

// Row for enrolled courses
const Row = ({ course, teacher, time, enrolled, onDrop }) => (
  <tr>
    <td>{course}</td>
    <td>{teacher}</td>
    <td>{time}</td>
    <td>{enrolled}</td>
    <td>
      <button onClick={() => onDrop(course)}>Drop</button>
    </td>
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
const CourseTable = ({ data, onDrop }) => (
  <table>
    <thead>
      <tr>
        <th>Course</th>
        <th>Teacher</th>
        <th>Time</th>
        <th>Enrolled</th>
        <th>Drop</th>
      </tr>
    </thead>
    <tbody>
      {data.map((course, index) => (
        <Row key={index} {...course} onDrop={onDrop} />
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

  const fetchEnrolledCourses = () => {
    const username = localStorage.getItem('username');
    fetch(`http://localhost:5000/api/student/courses?username=${username}`)
      .then(res => res.json())
      .then(data => setEnrolledCourses(data))
      .catch(err => console.error('Error fetching enrolled courses:', err));
  };  
  
  const fetchAvailableCourses = () => {
    fetch('http://localhost:5000/api/school/courses')
      .then((res) => res.json())
      .then((data) => setAvailableCourses(data))
      .catch((err) => console.error('Error fetching available courses:', err));
  };
  
  

  // Redirect if not a student
  useEffect(() => {
    if (role !== 'student') {
      navigate('/login');
    }
  }, [role, navigate]);

  useEffect(() => {
    if (showMyCourses) {
      fetchEnrolledCourses();
    } else {
      fetchAvailableCourses();
    }
  }, [showMyCourses]);
  
  const handleSignup = async (courseName) => {
    try {
      const res = await fetch('http://localhost:5000/api/student/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course: courseName,
          student_name: localStorage.getItem('username')
        }),
      });
  
      const data = await res.json();
      setMessage(data.message);
  
      if (res.ok) {
        setShowMyCourses(true); 
        fetchEnrolledCourses();
        fetchAvailableCourses(); 
      }
    } catch (err) {
      console.error(err);
      setMessage('Signup failed');
    }
  };  
  

  const handleDrop = async (courseName) => {
    try {
      const res = await fetch('http://localhost:5000/api/student/drop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course: courseName,
          student_name: localStorage.getItem('username')  
        }),
      });
  
      const data = await res.json();
      setMessage(data.message);
  
      if (res.ok) {
        fetchEnrolledCourses();
        fetchAvailableCourses();
      }
      
    } catch (err) {
      console.error(err);
      setMessage('Drop failed');
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
            <CourseTable data={enrolledCourses} onDrop={handleDrop} />
          ) : (
            <AddCourseTable data={availableCourses} onSignup={handleSignup} />
          )}
        </div>
      </div>
    </div>
  );
}
