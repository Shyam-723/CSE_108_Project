import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSignOutAlt, FaUserShield } from 'react-icons/fa';
import '../App.css';

function AdminView() {
  // Redirect to the Flask admin interface
  useEffect(() => {
    window.location.href = 'http://localhost:5000/admin';
  }, []);

  return (
    <div className="app-container">
      <div id="course-container">
        <div id="top-bar">
          <h1 id="welcome">Admin Dashboard</h1>
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
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <FaUserShield size={50} style={{ color: '#4a86e8', marginBottom: '20px' }} />
            <h2>Redirecting to Admin Dashboard...</h2>
            <p>If you are not redirected automatically, click the button below:</p>
            <a 
              href="http://localhost:5000/admin" 
              className="button"
              style={{
                display: 'inline-block',
                margin: '20px 0',
                padding: '10px 20px',
                backgroundColor: '#4a86e8',
                color: 'white',
                borderRadius: '4px',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              Go to Admin Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminView;