import { useState, useEffect } from "react";
import API from "../services/api";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../assets/ContactBook.css";

export default function UserProfile({ user, setUser }) {
  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", address: "",
    birthday: "", nationality: "Việt Nam", ethnicity: "Kinh",
    password: "", // Thay thế vị trí giới tính bằng mật khẩu
    avatar: null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [preview, setPreview] = useState(null);

  // Load thông tin khi vào trang
  useEffect(() => {
    const fetchMe = async () => {
        try {
            const res = await API.get('/auth/me');
            // Password để rỗng, chỉ khi nào nhập mới tính là đổi
            setFormData(prev => ({...prev, ...res.data, password: ""})); 
            if(res.data.avatar) setPreview(`http://localhost:4000${res.data.avatar}`);
        } catch (err) { console.error(err); }
    };
    fetchMe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          setFormData({ ...formData, avatar: file });
          setPreview(URL.createObjectURL(file));
      }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if(key !== 'avatar' && formData[key] !== null) data.append(key, formData[key]);
        });
        if (formData.avatar instanceof File) data.append('avatar', formData.avatar);

        const res = await API.put('/auth/me', data, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        
        toast.success("Cập nhật thông tin thành công!");
        setFormData(prev => ({...prev, password: ""})); 
        setUser(res.data); // Cập nhật avatar nhỏ bên Sidebar ngay lập tức
    } catch (err) {
        toast.error("Lỗi cập nhật!");
    }
  };

  return (
    <div className="card card-body shadow-sm rounded-4 border border-0 h-100 p-4">
      {/* Header Avatar to */}
      <div className="d-flex align-items-center mb-4">
          <div className="position-relative me-3 cardAvatar" style={{width: 60, height: 60}}>
              <img src={preview || "/img/avatarDefault.png"} className="w-100 h-100 rounded-circle border object-fit-cover" alt="User" />
              <label htmlFor="upload-me" className="position-absolute bottom-0 end-0 bg-white rounded-circle p-1 border" style={{cursor:'pointer', fontSize: 10}}>📷</label>
              <input type="file" id="upload-me" hidden onChange={handleFileChange} />
          </div>
          <div>
            <h3 className="fw-bold mb-0">{formData.username || 'Admin'}</h3> 
            <small className="text-muted">{formData.email}</small>
          </div>
      </div>

      <h3 className="text-center mb-4 fw-bold">Thông tin cá nhân</h3>

      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-md-6">
          <label className="form-label fw-medium">Tên*</label>
          <input type="text" name="name" className="form-control rounded-pill inputA" value={formData.name || ''} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label fw-medium">Ngày sinh</label>
          <input type="date" name="birthday" className="form-control rounded-pill inputA" value={formData.birthday || ''} onChange={handleChange} />
        </div>

        {/* MẬT KHẨU (Thay vì Giới tính) */}
        <div className="col-md-6">
            <label className="form-label fw-medium">Mật khẩu (Nhập để đổi)</label>
            <div className="position-relative">
                <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    className="form-control rounded-pill inputA" 
                    value={formData.password} 
                    onChange={handleChange} 
                    placeholder="********" 
                />
                <span className="position-absolute top-50 end-0 translate-middle-y me-3 pointer" onClick={() => setShowPassword(!showPassword)} style={{cursor: 'pointer'}}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
            </div>
        </div>

        <div className="col-md-6">
          <label className="form-label fw-medium">Số điện thoại</label>
          <input type="text" name="phone" className="form-control rounded-pill inputA" value={formData.phone || ''} onChange={handleChange} />
        </div>
        
        <div className="col-md-6">
          <label className="form-label fw-medium">Email</label>
          <input type="email" name="email" className="form-control rounded-pill inputA" value={formData.email || ''} disabled style={{backgroundColor: '#e9ecef'}} />
        </div>
        <div className="col-md-6">
          <label className="form-label fw-medium">Địa chỉ</label>
          <input type="text" name="address" className="form-control rounded-pill inputA" value={formData.address || ''} onChange={handleChange} />
        </div>

        <div className="col-md-6">
            <label className="form-label fw-medium">Quốc tịch</label>
            <input type="text" name="nationality" className="form-control rounded-pill inputA" value={formData.nationality || ''} onChange={handleChange} />
        </div>
        <div className="col-md-6">
            <label className="form-label fw-medium">Dân tộc</label>
            <input type="text" name="ethnicity" className="form-control rounded-pill inputA" value={formData.ethnicity || ''} onChange={handleChange} />
        </div>
        
        <div className="col-12">
            <label className="form-label fw-medium">Giới thiệu thêm</label>
             <textarea className="form-control rounded-4 inputA" rows="3" disabled placeholder="Phần này user không cần nhập..."></textarea>
        </div>

        <div className="col-12 text-center mt-4">
            {/* CHỈ CÓ NÚT SỬA */}
            <button type="submit" className="btn btn-success rounded-pill px-5 fw-bold">
                 Cập nhật thông tin
            </button>
        </div>
      </form>
    </div>
  );
}