import { useState } from 'react';
import API from '../services/api';
import '../assets/ContactBook.css'

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/auth/register', { username, email, password });
            setMessage('Đăng ký thành công! Bây giờ bạn có thể đăng nhập.');
        } catch (err) {
            setMessage(err.response?.data?.message || 'Đăng ký thất bại');
        }
    };


    return (
      <div className="w-100 d-flex align-items-center justify-content-center" style={{height: "735px"}}>
        <div className="w-25 h-50 border rounded-4 shadow-lg bg-body-tertiary d-flex flex-column justify-content-evenly align-items-center">
          <div>
              <h2 className="fw-bold">CONTACT BOOK</h2>
          </div>
          <div className="w-100 h-auto d-flex flex-column align-items-center">

            <form className="w-75 d-flex flex-column justify-content-between" onSubmit={handleSubmit}>
              <div className="mb-3" style={{color:'red'}}>
                <input
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                />
              </div>
              <div className="mb-3">
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                />
              </div>
              <button type="submit" className="btn btn-primary w-100 fw-semibold btn-1">
                Signup
              </button>
            </form>
          </div>
              {message && <div className="alert alert-info w-75 text-center" style={{height:'35px'}}>{message}</div>}
          <div >
              <p>Already have an account?
                  <a className="text-decoration-none text-primary" href="/login"> Login</a>
              </p>
          </div>
        </div>
      </div>
    );
}

export default Register;