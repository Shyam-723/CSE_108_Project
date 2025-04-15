import React, { useState, useEffect } from 'react';
import { FaSignOutAlt } from 'react-icons/fa';
import '../App.css'; // Assuming your shared styles live here
import { useNavigate } from 'react-router-dom';

export default function AdminView() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [newCourse, setNewCourse] = useState({ course: '', teacher: '', time: '', max: 30 });
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const displayName = localStorage.getItem('displayName') || 'Admin';

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = () => {
    fetch('http://localhost:5000/api/admin/courses')
      .then(res => res.json())
      .then(setCourses)
      .catch(err => console.error(err));
  };

  const fetchStudents = (courseName) => {
    fetch('http://localhost:5000/api/admin/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course: courseName })
    })
      .then(res => res.json())
      .then(setStudents)
      .catch(err => console.error(err));
  };

  const handleSelectCourse = (courseName) => {
    setSelectedCourse(courseName);
    fetchStudents(courseName);
  };

  const handleDeleteCourse = (courseName) => {
    fetch('http://localhost:5000/api/admin/delete_course', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course: courseName })
    }).then(() => {
      setSelectedCourse(null);
      setStudents([]);
      fetchCourses();
    });
  };

  const handleAddCourse = () => {
    fetch('http://localhost:5000/api/admin/add_course', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCourse)
    }).then(() => {
      setNewCourse({ course: '', teacher: '', time: '', max: 30 });
      fetchCourses();
    });
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <div id="course-container">
        <div id="top-bar">
          <h1 id="welcome">Welcome {displayName}</h1>
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
          <div className="admin-section">
            <h2>All Courses</h2>
            <table>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Teacher</th>
                  <th>Time</th>
                  <th>Enrollment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c, idx) => (
                  <tr key={idx}>
                    <td>{c.course}</td>
                    <td>{c.teacher}</td>
                    <td>{c.time}</td>
                    <td>{c.enrolled}</td>
                    <td>
                      <button onClick={() => handleSelectCourse(c.course)}>View Students</button>
                      <button onClick={() => handleDeleteCourse(c.course)} style={{ marginLeft: '1rem', color: 'red' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 style={{ marginTop: '2rem' }}>Add a New Course</h3>
            <div className="form-inline" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <input placeholder="Course Name" value={newCourse.course} onChange={(e) => setNewCourse({ ...newCourse, course: e.target.value })} />
              <input placeholder="Teacher" value={newCourse.teacher} onChange={(e) => setNewCourse({ ...newCourse, teacher: e.target.value })} />
              <input placeholder="Time" value={newCourse.time} onChange={(e) => setNewCourse({ ...newCourse, time: e.target.value })} />
              <input type="number" placeholder="Max" value={newCourse.max} onChange={(e) => setNewCourse({ ...newCourse, max: parseInt(e.target.value) })} />
              <button onClick={handleAddCourse}>Add</button>
            </div>

            {selectedCourse && (
              <>
                <h3>Students in {selectedCourse}</h3>
                <ul>
                  {students.map((s, idx) => (
                    <li key={idx}>{s.name} — Grade: {s.grade}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
