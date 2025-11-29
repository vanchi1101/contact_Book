import { useEffect, useState } from "react";
import API from "../services/api";
import ContactForm from "./ContactForm";
import UserProfile from "./UserProfile"; // Import trang cá nhân
import Sidebar from "./Sidebar"; // Import Sidebar mới tách ra
import { FaRegTrashAlt, FaRegEdit, FaStar, FaCaretDown } from "react-icons/fa";
import { LuImageUp } from "react-icons/lu";
import { CiCircleRemove } from "react-icons/ci";
import { PiTagSimpleFill } from "react-icons/pi";
import { toast } from "react-toastify";
import "../assets/ContactBook.css";

// Domain backend
const BACKEND_URL = "http://localhost:4000";

export default function ContactsList({ user, setUser }) {
  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State quản lý giao diện: "contacts" (Danh bạ) hoặc "profile" (Thông tin cá nhân)
  const [viewMode, setViewMode] = useState("contacts"); 

  const [selectedContact, setSelectedContact] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [search, setSearch] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  // State bộ lọc & Nhóm
  const [filter, setFilter] = useState("thongthuong");
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [showContactGroupDropdown, setShowContactGroupDropdown] = useState(false);
  const [groups] = useState(["Bạn bè", "Người thân", "Gia đình", "Khách hàng", "Sếp", "Đồng nghiệp"]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [nameGroup, setNameGroup] = useState("Nhóm");

  // State cho modal upload avatar (Contact)
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [modalAvatarPreview, setModalAvatarPreview] = useState(null);
  const [modalAvatarFile, setModalAvatarFile] = useState(null);

  const groupColors = {
    "Bạn bè": "#00FFFF", "Người thân": "#FF0000", "Gia đình": "#FF69B4",
    "Khách hàng": "#00FF00", Sếp: "#0000FF", "Đồng nghiệp": "#FF8C00",
  };

  // --- API CALLS ---
  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await API.get("/contacts");
      const updatedContacts = res.data.map((contact) => ({
        ...contact,
        favourite: contact.favourite === 1,
        groups_lh: contact.groups_lh ? JSON.parse(contact.groups_lh) : [],
        link_img: contact.link_img
          ? `${BACKEND_URL}${contact.link_img}?t=${Date.now()}`
          : `${BACKEND_URL}/imgA/avatarDefault.png`,
      }));
      setContacts(updatedContacts);
      // Cập nhật lại contact đang chọn nếu có thay đổi
      if (selectedContact) {
        const updatedSelected = updatedContacts.find((c) => c.id === selectedContact.id);
        if (updatedSelected) setSelectedContact(updatedSelected);
      }
    } catch (err) {
      console.error("Lỗi tải danh bạ:", err);
      toast.error("Không thể tải danh bạ!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // --- HANDLERS (Xử lý sự kiện) ---

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa liên hệ này?")) return;
    try {
      await API.delete(`/contacts/${id}`);
      toast.info("Đã xóa liên hệ!");
      setSelectedContact(null);
      setEditingContact(null);
      fetchContacts();
    } catch (err) {
      toast.error("Lỗi khi xóa!");
    }
  };

  const handleToggleFavourite = async (contact) => {
    try {
      await API.put(`/contacts/${contact.id}`, { favourite: contact.favourite ? 0 : 1 });
      toast.success("Cập nhật yêu thích thành công!");
      fetchContacts();
    } catch (err) {
      toast.error("Lỗi khi cập nhật yêu thích!");
    }
  };

  const handleToggleGroup = async (contact, group) => {
    const updatedGroups = contact.groups_lh.includes(group)
      ? contact.groups_lh.filter((g) => g !== group)
      : [...contact.groups_lh, group];
    try {
      await API.put(`/contacts/${contact.id}`, { groups_lh: JSON.stringify(updatedGroups) });
      toast.success("Cập nhật nhóm thành công!");
      fetchContacts();
    } catch (err) {
      toast.error("Lỗi khi cập nhật nhóm!");
    }
  };

  // --- LOGIC MODAL UPLOAD AVATAR ---
  const handleModalUpload = async () => {
    if (!selectedContact || !modalAvatarFile) {
      toast.error("Vui lòng chọn ảnh!");
      return;
    }
    const formData = new FormData();
    formData.append("avatar", modalAvatarFile);
    try {
      await API.put(`/contacts/${selectedContact.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchContacts();
      setShowAvatarModal(false);
      setModalAvatarFile(null);
      setModalAvatarPreview(null);
      toast.success("Cập nhật avatar thành công!");
    } catch (err) {
      toast.error("Lỗi khi cập nhật avatar!");
    }
  };

  const handleModalRemoveAvatar = () => {
      setModalAvatarFile(null);
      setModalAvatarPreview(null);
  };

  // --- LOGIC LỌC & SẮP XẾP ---
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search) ||
      c.note?.toLowerCase().includes(search.toLowerCase());
    if (filter === "yeuthich") return matchesSearch && c.favourite;
    if (filter === "nhom" && selectedGroup) return matchesSearch && c.groups_lh.includes(selectedGroup);
    return matchesSearch;
  });

  const getLastName = (fullName) => {
    if (!fullName) return "";
    const parts = fullName.trim().split(/\s+/);
    return parts[parts.length - 1];
  };

  const groupedContacts = filteredContacts
    .sort((a, b) => {
        const normalize = (str) => str.normalize("NFC").toLowerCase().replace(/đ/g, "d");
        return normalize(getLastName(a.name)).localeCompare(normalize(getLastName(b.name)), "vi", { sensitivity: "base" });
    })
    .reduce((acc, contact) => {
      const firstLetter = getLastName(contact.name).charAt(0).toUpperCase().replace("Đ", "D");
      if (!acc[firstLetter]) acc[firstLetter] = [];
      acc[firstLetter].push(contact);
      return acc;
    }, {});

  // --- RENDER GIAO DIỆN ---
  return (
    <div className="d-flex flex-row bg-secondary-subtle p-4 gap-4 fontC" style={{ height: "739px" }}>
      
      {/* 1. CỘT TRÁI: DÙNG COMPONENT SIDEBAR MỚI */}
      <div className="d-flex flex-column h-100" style={{ width: "350px", minWidth: "300px" }}>
         <Sidebar 
            user={user}
            logout={() => setUser(null)}
            viewMode={viewMode}
            setViewMode={setViewMode}
            search={search}
            setSearch={setSearch}
            setIsAddingNew={setIsAddingNew}
            setSelectedContact={setSelectedContact}
            setEditingContact={setEditingContact}
            filter={filter}
            setFilter={setFilter}
            nameGroup={nameGroup}
            setNameGroup={setNameGroup}
            setSelectedGroup={setSelectedGroup}
            groups={groups}
            showGroupDropdown={showGroupDropdown}
            setShowGroupDropdown={setShowGroupDropdown}
            groupedContacts={groupedContacts}
            selectedContact={selectedContact}
         />
      </div>

      {/* 2. CỘT PHẢI: NỘI DUNG CHÍNH */}
      <div className="d-flex flex-column flex-grow-1 h-100">
        <div className="flex-grow-1 h-100">
          
          {/* LOGIC CHUYỂN ĐỔI GIAO DIỆN (View Switching) */}
          
          {viewMode === 'profile' ? (
            // VIEW 1: TRANG CÁ NHÂN
            <UserProfile user={user} setUser={setUser} />
          ) : isAddingNew || editingContact ? (
            // VIEW 2: FORM THÊM/SỬA
            <ContactForm
              onSuccess={() => {
                  fetchContacts();
                  setIsAddingNew(false);
                  setEditingContact(null);
                  setSelectedContact(null);
              }}
              editingContact={editingContact}
              setEditingContact={setEditingContact}
              isAddingNew={isAddingNew}
              setIsAddingNew={setIsAddingNew}
            />
          ) : selectedContact ? (
            // VIEW 3: CHI TIẾT LIÊN HỆ
            <div className="card card-body shadow-sm rounded-4 border border-0 h-100">
              <div className="d-flex align-items-center mb-3">
                <div
                  className="cardAvatar pointer rounded p-2 position-relative"
                  onClick={() => {
                    setShowAvatarModal(true);
                    setModalAvatarPreview(selectedContact.link_img);
                    setModalAvatarFile(null);
                  }}
                >
                  <img src={selectedContact.link_img} className="rounded-circle me-2" alt="avatar" width="60" height="60" />
                  <div className="iconChangeAvatar"><LuImageUp /></div>
                </div>
                <h3 className="fw-bold mb-0">{selectedContact.name}</h3>
                <FaCaretDown className="ms-2 pointer" onClick={() => setShowContactGroupDropdown(!showContactGroupDropdown)} />
              </div>

              {/* Dropdown chọn nhóm cho contact */}
              {showContactGroupDropdown && (
                <div className="dropdown-menu d-block position-absolute bg-white shadow p-2 rounded-4" style={{ top: "130px", left: "280px", zIndex: 10 }}>
                  {groups.map((group) => (
                    <div key={group} className="dropdown-item pointer" onClick={() => handleToggleGroup(selectedContact, group)}>
                      <PiTagSimpleFill style={{ color: groupColors[group] }} /> {group}
                      {selectedContact.groups_lh.includes(group) && <span className="ms-auto float-end">✓</span>}
                    </div>
                  ))}
                  <div className="dropdown-item text-danger pointer mt-1 border-top pt-1" onClick={() => {
                       // Gọi API reset avatar (logic cũ)
                       handleModalUpload(); // Hoặc viết hàm riêng reset avatar
                  }}>
                     <CiCircleRemove/> Xóa ảnh
                  </div>
                </div>
              )}

              <h5 className="fw-medium fs-3 m-auto mb-5 border-bottom pb-2">Thông tin</h5>
              
              <div className="row g-3">
                <div className="col-md-4"><label className="form-label fw-medium">Tên*</label><input className="form-control rounded-pill border-dark inputA" value={selectedContact.name} readOnly /></div>
                <div className="col-md-4"><label className="form-label fw-medium">Ngày sinh</label><input className="form-control rounded-pill border-dark inputA" value={selectedContact.birthday || ""} readOnly /></div>
                <div className="col-md-4"><label className="form-label fw-medium">SĐT</label><input className="form-control rounded-pill border-dark inputA" value={selectedContact.phone} readOnly /></div>
                <div className="col-md-4"><label className="form-label fw-medium">Email</label><input className="form-control rounded-pill border-dark inputA" value={selectedContact.email} readOnly /></div>
                <div className="col-md-4"><label className="form-label fw-medium">Địa chỉ</label><input className="form-control rounded-pill border-dark inputA" value={selectedContact.address || ""} readOnly /></div>
                <div className="col-md-4"><label className="form-label fw-medium">Quốc tịch</label><input className="form-control rounded-pill border-dark inputA" value={selectedContact.nationality || ""} readOnly /></div>
                <div className="col-md-4"><label className="form-label fw-medium">Dân tộc</label><input className="form-control rounded-pill border-dark inputA" value={selectedContact.ethnicity || ""} readOnly /></div>
                <div className="col-md-4"><label className="form-label fw-medium">Công việc</label><input className="form-control rounded-pill border-dark inputA" value={selectedContact.job || ""} readOnly /></div>
                <div className="col-md-4"><label className="form-label fw-medium">Giới tính</label><input className="form-control rounded-pill border-dark inputA" value={selectedContact.gender || ""} readOnly /></div>
              </div>
              
              <div className="mt-3">
                <label className="form-label fw-medium">Ghi chú thêm</label>
                <textarea className="form-control rounded-4 border-dark inputA" value={selectedContact.note} readOnly rows={3} style={{ height: "100px" }} />
              </div>

              <div className="mt-4 d-flex justify-content-center gap-3">
                <button className={`btn ${selectedContact.favourite ? "btn-warning" : "btn-outline-warning"} rounded-pill px-3`} onClick={() => handleToggleFavourite(selectedContact)}>
                  <FaStar className="me-2" /> {selectedContact.favourite ? "Bỏ yêu thích" : "Yêu thích"}
                </button>
                <button className="btn btn-dark rounded-pill px-3" onClick={() => handleEdit(selectedContact)}>
                  <FaRegEdit className="me-2" /> Sửa thông tin
                </button>
                <button className="btn btn-danger rounded-pill px-3" onClick={() => handleDelete(selectedContact.id)}>
                  <FaRegTrashAlt className="me-2" /> Xóa bỏ
                </button>
              </div>
            </div>
          ) : (
            // VIEW 4: MÀN HÌNH CHÀO MỪNG
            <div className="d-flex flex-column justify-content-center align-items-center bg-white h-100 rounded-4 shadow">
              <div className="fs-3 fw-semibold">Chào mừng bạn quay lại với sổ tay liên lạc</div>
              <img src="/img/imgFirst.png" alt="" width={500} style={{maxWidth: '100%'}} />
            </div>
          )}
        </div>
      </div>

      {/* MODAL UPLOAD AVATAR CONTACT */}
      {showAvatarModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Cập nhật ảnh đại diện</h5>
                <button type="button" className="btn-close" onClick={() => setShowAvatarModal(false)}></button>
              </div>
              <div className="modal-body text-center">
                <div className="mb-3 border border-dashed p-3 rounded bg-light">
                   {modalAvatarPreview ? (
                      <img src={modalAvatarPreview} className="rounded-circle" width="150" height="150" alt="Preview" />
                   ) : <span>Chọn ảnh để xem trước</span>}
                </div>
                <input type="file" className="form-control" accept="image/*" onChange={(e) => {
                    if(e.target.files[0]) {
                        setModalAvatarFile(e.target.files[0]);
                        setModalAvatarPreview(URL.createObjectURL(e.target.files[0]));
                    }
                }} />
                {modalAvatarFile && <button className="btn btn-danger btn-sm mt-2" onClick={handleModalRemoveAvatar}><CiCircleRemove/> Hủy chọn</button>}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowAvatarModal(false)}>Đóng</button>
                <button className="btn btn-primary" onClick={handleModalUpload} disabled={!modalAvatarFile}>Lưu thay đổi</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}