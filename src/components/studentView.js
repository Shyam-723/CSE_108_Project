import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
// import '..login.js'; 
import '../App.js';

const courses = [
  {course: 'Physics 009', teacher: 'Susan B', time: 'TR 11:00-11:50 AM', enrolled: '5/10'},
  {course: 'Math 131', teacher: 'Mr.B', time: 'TR 11:00-11:50 AM', enrolled: '10/10'},
  {course: 'CSE 120', teacher: 'Susan B', time: 'TR 11:00-11:50 AM', enrolled: '5/10'},
];

const addCourse = [
  {course: 'Physics 009', teacher: 'Susan B', time: 'TR 11:00-11:50 AM', enrolled: '5/10', add: '+'},
  {course: 'Math 131', teacher: 'Mr.B', time: 'TR 11:00-11:50 AM', enrolled: '10/10', add: '+'},
  {course: 'CSE 120', teacher: 'Susan B', time: 'TR 11:00-11:50 AM', enrolled: '5/10', add: '+'},
]

const name = 'Rahsaan'; 

// row component for table rows
const Row = (props) => {
  const {course, teacher, time, enrolled} = props
  return (
    <tr className="table-row">
      <td>{course}</td>
      <td>{teacher}</td>
      <td>{time}</td>
      <td>{enrolled}</td>
      
    </tr>
  )
}

const AddRow = (props) => {
  const {course, teacher, time, enrolled, add} = props
  return (
    <tr className="table-row">
      <td>{course}</td>
      <td>{teacher}</td>
      <td>{time}</td>
      <td>{enrolled}</td>
      <td>{add}</td>
    </tr>
  )
}



// course table 
const CourseTable = (props) => {
  const {data} = props
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
          />
        ))}
      </tbody>
    </table>
  )
}

const AddCourseTable = (props) => { 
  const {data} = props
  return (
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
          />
        ))}
      </tbody>
    </table>
  ) 
}




function App() {
  const [rows, setRows] = useState(courses)
  const [addRows, setAddRows] = useState(addCourse)
  const [showCourseView, setShowCourseView] = useState(true)


  return (
    <div className="app-container">
      <div id="course-container">
        <div id="top-bar">
          <h1 id="welcome">Welcome {name}</h1>
          <h1>UC Merced</h1>
          <a href = "../login.js"><h1>Sign Out</h1></a>
        </div>

        <div className = 'content-container'>
          <div className = 'course-view'>
            <p onClick={() => setShowCourseView(true)}>Courses</p>
            <p onClick={()=> setShowCourseView(false)}>Add Coure</p>
          </div>

          {/* cond ? (true) : (false) */}
          {showCourseView ? (
            <div id="stu-courses" className="course-section">
              <div id="course-section">
                <CourseTable data={rows}/>
              </div>
            </div> 
            ) : (
            <div id="add-courses" className="course-section">
              <div id="course-section">
                <AddCourseTable data={addRows}/>
              </div>
            </div>
          )}

          

          
        </div>
        

      </div>
    </div>
  );
}

export default App;