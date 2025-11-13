import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import '../assets/ContactBook.css'

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // dùng để điều hướng chuyển trang

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { username, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      onLogin(res.data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
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
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 fw-semibold btn-1">
              Login
            </button>
          </form>
        </div>
        {error && <div className="alert alert-danger w-75 text-center">{error}</div>}
        <div >
            <p>Don't have an account?
                <a className="text-decoration-none text-primary" href="/register"> Signup</a>
            </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
