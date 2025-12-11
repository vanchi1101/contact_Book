import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './components/Login';
import Register from './components/Register';
import ContactsList from './components/ContactsList';
import './App.css'


function App() {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });

  return (
    <div className="">
        <Router>
          <Routes>
            {/* Nếu chưa login thì điều hướng sang /login */}
            <Route
              path="/"
              element={
                user ? (
                  <ContactsList user={user} setUser={setUser} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route path="/login" element={<Login onLogin={u => setUser(u)} />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </Router>
      
    </div>
    
  );
}

export default App;
