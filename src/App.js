import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Login from './components/login.js';
import StudentView from './components/studentView.js';
import './App.css';

function App() {
  return (
    <div className="App">
      <nav>
        <ul>
          <li>
            <Link to="/login">Login</Link>
          </li>
          <li>
            <Link to="/student">Student View</Link>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/student" element={<StudentView />} />
      </Routes>
    </div>
  );
}

export default App;
