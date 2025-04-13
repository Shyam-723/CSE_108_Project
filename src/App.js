import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Login from './components/login.js';
import StudentView from './components/studentView.js';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <nav>
          <ul>
            <li>
              <Link to="/">Login</Link>
            </li>
            <li>
              <Link to="/student">Student View</Link>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/student" element={<StudentView />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;