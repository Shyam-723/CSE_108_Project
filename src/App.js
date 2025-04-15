import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Login from './components/login.js';
import StudentView from './components/studentView.js';
import TeacherView from './components/teacherView.js'
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/student" element={<StudentView />} />
          <Route path="/teacher" element={<TeacherView />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;