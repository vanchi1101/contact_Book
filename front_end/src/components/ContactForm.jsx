import { useState, useEffect } from "react";
import API from "../services/api";
import { FaRegSave, FaRegTrashAlt } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import { toast } from "react-toastify";
import "../assets/ContactBook.css";

// Domain backend
const BACKEND_URL = "http://localhost:4000";

export default function ContactForm({ onSuccess, editingContact, setEditingContact, setIsAddingNew }) {
  // State
  const [form, setForm] = useState({
    name: "",
    birthday: "",
    phone: "",
    email: "",
    address: "",
    nationality: "",
    ethnicity: "",
    job: "",
    gender: "",
    note: "",
    favourite: 0,
    link_img: "/imgA/avatarDefault.png",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(`${BACKEND_URL}/imgA/avatarDefault.png`);

  // Convert dd-MM-yyyy to YYYY-MM-DD for backend
  const toBackendDate = (dateStr) => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split("-");
    if (day && month && year) {
      return `${year}-${month}-${day}`;
    }
    return null;
  };
  
  // Cập nhật form và avatarPreview khi editingContact thay đổi
  useEffect(() => {
    if (editingContact) {
      // Loại bỏ BACKEND_URL nếu link_img đã chứa nó
      const relativeLinkImg = editingContact.link_img?.startsWith(BACKEND_URL)
        ? editingContact.link_img.replace(BACKEND_URL, "")
        : editingContact.link_img || "/imgA/avatarDefault.png";

      setForm({
        name: editingContact.name || "",
        birthday: editingContact.birthday || "",
        phone: editingContact.phone || "",
        email: editingContact.email || "",
        address: editingContact.address || "",
        nationality: editingContact.nationality || "",
        ethnicity: editingContact.ethnicity || "",
        job: editingContact.job || "",
        gender: editingContact.gender || "",
        note: editingContact.note || "",
        favourite: editingContact.favourite ? 1 : 0,
        link_img: relativeLinkImg,
      });
      setAvatarPreview(`${BACKEND_URL}${relativeLinkImg}?t=${Date.now()}`);
      setAvatarFile(null);
    } else {
      setForm({
        name: "",
        birthday: "",
        phone: "",
        email: "",
        address: "",
        nationality: "",
        ethnicity: "",
        job: "",
        gender: "",
        note: "",
        favourite: 0,
        link_img: "/imgA/avatarDefault.png",
      });
      setAvatarPreview(`${BACKEND_URL}/imgA/avatarDefault.png`);
      setAvatarFile(null);
    }
  }, [editingContact]);

  // Xử lý thay đổi input form
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Xử lý chọn ảnh từ File Explorer
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setForm({ ...form, link_img: null });
    } else {
      toast.warning("Vui lòng chọn file ảnh!");
    }
  };

  // Xử lý kéo thả ảnh
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setForm({ ...form, link_img: null });
    } else {
      toast.warning("Vui lòng kéo thả file ảnh!");
    }
  };

  // Xử lý dán ảnh từ clipboard
  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const file = item.getAsFile();
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
        setForm({ ...form, link_img: null });
        return;
      }
    }
    toast.warning("Dữ liệu dán không phải là ảnh!");
  };

  // Ngăn mặc định khi kéo thả
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Xóa ảnh avatar, đặt lại mặc định
  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(`${BACKEND_URL}/imgA/avatarDefault.png`);
    setForm({ ...form, link_img: "/imgA/avatarDefault.png" });
  };

  // Xử lý gửi form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!form.name || !form.phone) {
        toast.warning("Vui lòng nhập ít nhất tên và số điện thoại!");
        return;
      }

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "birthday") {
          formData.append(key, toBackendDate(value));
        } else {
          formData.append(key, value);
        }
      });
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      let res;
      if (editingContact) {
        res = await API.put(`/contacts/${editingContact.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Cập nhật liên hệ thành công!");
      } else {
        res = await API.post("/contacts", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Thêm liên hệ mới thành công!");
      }

      const newLinkImg = res.data.link_img || "/imgA/avatarDefault.png";
      setAvatarPreview(`${BACKEND_URL}${newLinkImg}?t=${Date.now()}`);

      setForm({
        name: "",
        birthday: "",
        phone: "",
        email: "",
        address: "",
        nationality: "",
        ethnicity: "",
        job: "",
        gender: "",
        note: "",
        favourite: 0,
        link_img: "/imgA/avatarDefault.png",
      });
      setAvatarFile(null);
      setAvatarPreview(`${BACKEND_URL}/imgA/avatarDefault.png`);
      setEditingContact(null);
      setIsAddingNew(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Lỗi lưu liên hệ:", err.response?.data || err.message);
      toast.error(`Lỗi khi lưu liên hệ: ${err.response?.data?.message || err.message}`);
    }
  };

  // Xử lý hủy form
  const handleCancel = () => {
    setForm({
      name: "",
      birthday: "",
      phone: "",
      email: "",
      address: "",
      nationality: "",
      ethnicity: "",
      job: "",
      gender: "",
      note: "",
      favourite: 0,
      link_img: "/imgA/avatarDefault.png",
    });
    setAvatarFile(null);
    setAvatarPreview(`${BACKEND_URL}/imgA/avatarDefault.png`);
    setEditingContact(null);
    setIsAddingNew(false);
  };

  return (
    <form className="card card-body shadow-sm border border-0 rounded-4" onSubmit={handleSubmit}>
      <h5 className="fw-bold mb-3">
        {editingContact ? "Chỉnh sửa thông tin" : "Thêm liên hệ mới"}
      </h5>
      <div
        className="mb-3 d-flex align-items-center border border-dashed border-2 rounded p-2"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onPaste={handlePaste}
        style={{ cursor: "pointer", backgroundColor: "#f8f9fa" }}
      >
        <img
          src={avatarPreview}
          className="rounded-circle me-2"
          alt="avatar"
          width="50"
          height="50"
          onClick={() => document.getElementById("avatarInput").click()}
        />
        <input
          id="avatarInput"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleAvatarChange}
        />
        <button
          type="button"
          className="btn btn-outline-danger btn-sm rounded-pill"
          onClick={handleRemoveAvatar}
        >
          <FaRegTrashAlt /> Xóa ảnh
        </button>
      </div>
      <div className="row g-3 mt-2">
        <div className="col-md-4">
          <label className="form-label fw-medium">Tên</label>
          <input
            className="form-control rounded-pill inputA border border-dark"
            name="name"
            placeholder="Điền thông tin tại đây"
            value={form.name}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label fw-medium">Ngày sinh</label>
          <input
            className="form-control rounded-pill inputA border border-dark"
            name="birthday"
            placeholder="Điền thông tin tại đây"
            value={form.birthday}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label fw-medium">SĐT di động</label>
          <input
            className="form-control rounded-pill inputA border border-dark"
            name="phone"
            placeholder="Điền thông tin tại đây"
            value={form.phone}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label fw-medium">Email</label>
          <input
            className="form-control rounded-pill inputA border border-dark"
            name="email"
            placeholder="Điền thông tin tại đây"
            value={form.email}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label fw-medium">Địa chỉ</label>
          <input
            className="form-control rounded-pill inputA border border-dark"
            name="address"
            placeholder="Điền thông tin tại đây"
            value={form.address}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label fw-medium">Quốc tịch</label>
          <input
            className="form-control rounded-pill inputA border border-dark"
            name="nationality"
            placeholder="Điền thông tin tại đây"
            value={form.nationality}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label fw-medium">Dân tộc</label>
          <input
            className="form-control rounded-pill inputA border border-dark"
            name="ethnicity"
            placeholder="Điền thông tin tại đây"
            value={form.ethnicity}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label fw-medium">Công việc</label>
          <input
            className="form-control rounded-pill inputA border border-dark"
            name="job"
            placeholder="Điền thông tin tại đây"
            value={form.job}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label fw-medium">Giới tính</label>
          <input
            className="form-control rounded-pill inputA border border-dark"
            name="gender"
            placeholder="Điền thông tin tại đây"
            value={form.gender}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="mt-3">
        <label className="form-label fw-medium">Ghi chú thêm</label>
        <textarea
          className="form-control rounded-4 border border-dark inputA"
          name="note"
          placeholder="Điền thông tin tại đây"
          value={form.note}
          onChange={handleChange}
          rows={3}
          style={{height: "165px"}}
        />
      </div>
      <div className="mt-3 d-flex justify-content-center gap-2">
        <button type="submit" className="btn btn-primary rounded-pill px-3">
          <FaRegSave className="me-2" />
          {editingContact ? "Lưu thay đổi" : "Lưu liên hệ"}
        </button>
        <button
          type="button"
          className="btn btn-secondary rounded-pill px-3"
          onClick={handleCancel}
        >
          <MdOutlineCancel className="me-2" /> Hủy
        </button>
      </div>
    </form>
  );
}