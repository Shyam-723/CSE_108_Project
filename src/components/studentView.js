import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import '../App.js';

// Row for enrolled courses
const Row = ({ course, teacher, time, enrolled }) => (
  <tr className="table-row">
    <td>{course}</td>
    <td>{teacher}</td>
    <td>{time}</td>
    <td>{enrolled}</td>
  </tr>
);

// Row for courses available for signup
const AddRow = ({ course, teacher, time, enrolled, add, onSignup }) => (
  <tr className="table-row">
    <td>{course}</td>
    <td>{teacher}</td>
    <td>{time}</td>
    <td>{enrolled}</td>
    <td>
      {add === '+' ? (
        <button onClick={() => onSignup(course)}>{add}</button>
      ) : (
        add
      )}
    </td>
  </tr>
);

// Table displaying enrolled courses
const CourseTable = ({ data }) => (
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
        />
      ))}
    </tbody>
  </table>
);

// Table displaying courses offered by the school
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
      {data.map((row, index) => (
        <AddRow
          key={index}
          course={row.course}
          teacher={row.teacher}
          time={row.time}
          enrolled={row.enrolled}
          add={row.add}
          onSignup={onSignup}
        />
      ))}
    </tbody>
  </table>
);

function App() {
  // State for courses the student is enrolled in
  const [rows, setRows] = useState([]);
  // State for courses available to add
  const [addRows, setAddRows] = useState([]);
  // Toggle between "Courses" and "Add Course" views
  const [showCourseView, setShowCourseView] = useState(true);
  // For status or error messages
  const [message, setMessage] = useState('');
  // Hardcoded student name for demonstration
  const name = 'Rahsaan';

  // Fetch data from back end based on the view selected
  useEffect(() => {
    if (showCourseView) {
      // Fetch courses the student is enrolled in
      fetch('http://localhost:5000/api/student/courses')
        .then((res) => res.json())
        .then((data) => setRows(data))
        .catch((err) =>
          console.error('Error fetching enrolled courses:', err)
        );
    } else {
      // Fetch all courses offered by the school
      fetch('http://localhost:5000/api/school/courses')
        .then((res) => res.json())
        .then((data) => setAddRows(data))
        .catch((err) =>
          console.error('Error fetching school courses:', err)
        );
    }
  }, [showCourseView]);

  // Handler for signing up for a course
  const handleSignup = async (courseName) => {
    try {
      const response = await fetch('http://localhost:5000/api/student/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course: courseName }),
      });
      const data = await response.json();
      setMessage(data.message);
      if (response.ok) {
        // Refresh course lists after successful signup
        fetch('http://localhost:5000/api/student/courses')
          .then((res) => res.json())
          .then((data) => setRows(data))
          .catch((err) => console.error(err));
        fetch('http://localhost:5000/api/school/courses')
          .then((res) => res.json())
          .then((data) => setAddRows(data))
          .catch((err) => console.error(err));
      }
    } catch (error) {
      console.error('Error signing up for course:', error);
      setMessage('Error signing up for course');
    }
  };

  return (
    <div className="app-container">
      <div id="course-container">
        <div id="top-bar">
          <h1 id="welcome">Welcome {name}</h1>
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

        <div className="content-container">
          <div className="course-view">
            <p
              onClick={() => setShowCourseView(true)}
              style={
                showCourseView
                  ? { backgroundColor: '#f5f5f5' }
                  : { backgroundColor: 'white' }
              }
              className="px-4 py-2 rounded-lg font-medium"
            >
              Courses
            </p>
            <p
              onClick={() => setShowCourseView(false)}
              style={
                !showCourseView
                  ? { backgroundColor: '#f5f5f5' }
                  : { backgroundColor: 'white' }
              }
              className="px-4 py-2 rounded-lg font-medium"
            >
              Add Course
            </p>
          </div>

          {message && <p>{message}</p>}

          {showCourseView ? (
            <div id="stu-courses">
              <div id="course-section">
                <CourseTable data={rows} />
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

export default App;
