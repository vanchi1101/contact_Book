import { useEffect, useState } from "react";
import API from "../services/api";
import ContactForm from "./ContactForm";
import { FaRegTrashAlt, FaRegEdit, FaStar, FaCaretDown } from "react-icons/fa";
import { BsPlus } from "react-icons/bs";
import { PiTagSimpleFill } from "react-icons/pi";
import { LuImageUp } from "react-icons/lu";
import { CiCircleRemove } from "react-icons/ci";
import { toast } from "react-toastify";
import "../assets/ContactBook.css";

// Domain backend
const BACKEND_URL = "http://localhost:4000";

export default function ContactsList({ setUser }) {
  // State
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [search, setSearch] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [filter, setFilter] = useState("thongthuong");
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [showContactGroupDropdown, setShowContactGroupDropdown] = useState(false);
  const [groups, setGroups] = useState(["Người lạ", "Bạn bè", "Người thân", "Gia đình", "Khách hàng", "Sếp", "Đồng nghiệp"]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [nameGroup, setNameGroup] = useState("Nhóm");

  // State cho modal upload avatar
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [modalAvatarPreview, setModalAvatarPreview] = useState(null);
  const [modalAvatarFile, setModalAvatarFile] = useState(null);

  const [groupColorsState, setGroupColorsState] = useState({
    "Người lạ": "#808080",
    "Bạn bè": "#00FFFF",
    "Người thân": "#FF0000",
    "Gia đình": "#FF69B4",
    "Khách hàng": "#00FF00",
    "Sếp": "#0000FF",
    "Đồng nghiệp": "#FF8C00",
  });``

  const [groupIdMap, setGroupIdMap] = useState({});

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await API.get("/groups?user_id=1");
        const colors = {};
        const ids = {};
        res.data.forEach(g => {
          colors[g.name] = g.color || "#000000";
          ids[g.name] = g.id;
        });
        setGroups(res.data.map(g => g.name));
        setGroupColorsState(colors);
        setGroupIdMap(ids);
        } catch (err) {
          console.error(err);
        }
      };
      fetchGroups();
    }, []);

  // Tải danh sách liên hệ
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

  // Xóa liên hệ
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa liên hệ này?")) return;
    try {
      await API.delete(`/contacts/${id}`);
      toast.info("Đã xóa liên hệ!");
      setSelectedContact(null);
      setEditingContact(null);
      fetchContacts();
    } catch (err) {
      console.error("Lỗi xóa liên hệ:", err);
      toast.error("Lỗi khi xóa!");
    }
  };

  // Chuyển đổi trạng thái yêu thích
  const handleToggleFavourite = async (contact) => {
    const updatedFavourite = contact.favourite ? 0 : 1;
    const updatedContact = { ...contact, favourite: updatedFavourite === 1 };
    try {
      await API.put(`/contacts/${contact.id}`, { favourite: updatedFavourite });
      toast.success("Cập nhật yêu thích thành công!");
      setContacts(contacts.map((c) => (c.id === contact.id ? updatedContact : c)));
      setSelectedContact(updatedContact);
    } catch (err) {
      console.error("Lỗi cập nhật yêu thích:", err);
      toast.error("Lỗi khi cập nhật yêu thích!");
    }
  };

  // Chuyển đổi nhóm liên hệ
  const handleToggleGroup = async (contact, group) => {
    const updatedGroups = contact.groups_lh.includes(group)
      ? contact.groups_lh.filter((g) => g !== group)
      : [...contact.groups_lh, group];
    const updatedContact = { ...contact, groups_lh: updatedGroups };
    try {
      await API.put(`/contacts/${contact.id}`, { groups_lh: JSON.stringify(updatedGroups) });
      toast.success("Cập nhật nhóm thành công!");
      setContacts(contacts.map((c) => (c.id === contact.id ? updatedContact : c)));
      setSelectedContact(updatedContact);
    } catch (err) {
      console.error("Lỗi cập nhật nhóm:", err);
      toast.error("Lỗi khi cập nhật nhóm!");
    }
  };

  // Xử lý chọn ảnh từ File Explorer trong chi tiết liên hệ
  const handleUploadAvatar = () => {
    if (!selectedContact) {
      toast.error("Vui lòng chọn một liên hệ trước!");
      return;
    }
    setShowAvatarModal(true);
    setModalAvatarPreview(selectedContact.link_img);
    setModalAvatarFile(null);
  };

  // Xử lý kéo thả ảnh trong chi tiết liên hệ
  const handleDrop = (e) => {
    e.preventDefault();
    if (!selectedContact) {
      toast.error("Vui lòng chọn một liên hệ trước!");
      return;
    }
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setModalAvatarFile(file);
      setModalAvatarPreview(URL.createObjectURL(file));
      setShowAvatarModal(true);
    } else {
      toast.warning("Vui lòng kéo thả file ảnh!");
    }
  };

  // Ngăn mặc định khi kéo thả trong chi tiết liên hệ
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Xử lý dán ảnh từ clipboard trong chi tiết liên hệ
  const handlePaste = (e) => {
    if (!selectedContact) {
      toast.error("Vui lòng chọn một liên hệ trước!");
      return;
    }
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const file = item.getAsFile();
        setModalAvatarFile(file);
        setModalAvatarPreview(URL.createObjectURL(file));
        setShowAvatarModal(true);
        return;
      }
    }
    toast.warning("Dữ liệu dán không phải là ảnh!");
  };

  // Đặt lại avatar mặc định
  const handleRemoveAvatar = async () => {
    if (!selectedContact) {
      toast.error("Vui lòng chọn một liên hệ trước!");
      return;
    }
    try {
      const res = await API.put(`/contacts/${selectedContact.id}`, {
        link_img: "/imgA/avatarDefault.png",
      });
      const updatedContact = {
        ...selectedContact,
        link_img: "/imgA/avatarDefault.png",
        groups_lh: res.data.groups_lh ? JSON.parse(res.data.groups_lh) : [],
      };
      setContacts(contacts.map((c) => (c.id === selectedContact.id ? updatedContact : c)));
      setSelectedContact(updatedContact);
      fetchContacts();
      toast.success("Đã đặt lại avatar mặc định!");
    } catch (err) {
      console.error("Lỗi đặt lại avatar:", err.response?.data || err.message);
      toast.error(`Lỗi khi đặt lại avatar: ${err.response?.data?.message || err.message}`);
    }
  };

  // Xử lý chọn ảnh từ File Explorer trong modal
  const handleModalAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setModalAvatarFile(file);
      setModalAvatarPreview(URL.createObjectURL(file));
    } else {
      toast.warning("Vui lòng chọn file ảnh!");
    }
  };

  // Xử lý kéo thả ảnh trong modal
  const handleModalDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setModalAvatarFile(file);
      setModalAvatarPreview(URL.createObjectURL(file));
    } else {
      toast.warning("Vui lòng kéo thả file ảnh!");
    }
  };

  // Ngăn mặc định khi kéo thả trong modal
  const handleModalDragOver = (e) => {
    e.preventDefault();
  };

  // Xử lý dán ảnh từ clipboard trong modal
  const handleModalPaste = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const file = item.getAsFile();
        setModalAvatarFile(file);
        setModalAvatarPreview(URL.createObjectURL(file));
        return;
      }
    }
    toast.warning("Dữ liệu dán không phải là ảnh!");
  };

  // Xóa ảnh trong modal
  const handleModalRemoveAvatar = () => {
    setModalAvatarFile(null);
    setModalAvatarPreview(null);
  };

  // Upload ảnh từ modal
  const handleModalUpload = async () => {
    if (!selectedContact || !modalAvatarFile) {
      toast.error("Vui lòng chọn một liên hệ và ảnh để upload!");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", modalAvatarFile);

    try {
      const res = await API.put(`/contacts/${selectedContact.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updatedContact = {
        ...selectedContact,
        link_img: res.data.link_img || "/imgA/avatarDefault.png",
        groups_lh: res.data.groups_lh ? JSON.parse(res.data.groups_lh) : [],
      };
      setContacts(contacts.map((c) => (c.id === selectedContact.id ? updatedContact : c)));
      setSelectedContact(updatedContact);
      fetchContacts();
      setShowAvatarModal(false);
      setModalAvatarFile(null);
      setModalAvatarPreview(null);
      toast.success("Cập nhật avatar thành công!");
    } catch (err) {
      console.error("Lỗi cập nhật avatar:", err.response?.data || err.message);
      toast.error(`Lỗi khi cập nhật avatar: ${err.response?.data?.message || err.message}`);
    }
  };

  // Chọn liên hệ
  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    setEditingContact(null);
    setIsAddingNew(false);
    setShowContactGroupDropdown(false);
  };

  // Thêm liên hệ mới
  const handleAddNew = () => {
    setIsAddingNew(true);
    setSelectedContact(null);
    setEditingContact(null);
    setShowContactGroupDropdown(false);
  };

  // Sửa liên hệ
  const handleEdit = (contact) => {
    setEditingContact(contact);
    setIsAddingNew(false);
    setShowContactGroupDropdown(false);
  };

  // Callback khi lưu liên hệ thành công
  const onSuccess = () => {
    fetchContacts();
    setIsAddingNew(false);
    setEditingContact(null);
    setSelectedContact(null);
    setShowContactGroupDropdown(false);
  };

  // Lọc danh sách liên hệ
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search) ||
      c.note?.toLowerCase().includes(search.toLowerCase());
    if (filter === "yeuthich") {
      return matchesSearch && c.favourite;
    } else if (filter === "nhom" && selectedGroup) {
      return matchesSearch && c.groups_lh.includes(selectedGroup);
    }
    return matchesSearch;
  });

  // Lấy họ từ tên đầy đủ
  const getLastName = (fullName) => {
    if (!fullName) return "";
    const parts = fullName.trim().split(/\s+/);
    return parts[parts.length - 1];
  };

  // Sắp xếp theo họ (tiếng Việt)
  const vietnameseSortByLastName = (a, b) => {
    const normalize = (str) => str.normalize("NFC").toLowerCase().replace(/đ/g, "d");
    const lastNameA = normalize(getLastName(a.name));
    const lastNameB = normalize(getLastName(b.name));
    return lastNameA.localeCompare(lastNameB, "vi", { sensitivity: "base" });
  };

  // Nhóm liên hệ theo chữ cái đầu của họ
  const groupedContacts = filteredContacts
    .sort(vietnameseSortByLastName)
    .reduce((acc, contact) => {
      const firstLetter = getLastName(contact.name).charAt(0).toUpperCase().replace("Đ", "D");
      if (!acc[firstLetter]) acc[firstLetter] = [];
      acc[firstLetter].push(contact);
      return acc;
    }, {});

  return (
    <div className="d-flex flex-row bg-secondary-subtle p-4 gap-4 fontC" style={{ height: "739px" }}>
      <div className="d-flex flex-column h-100">
        <div className="w-100 bg-white pb-3 d-flex flex-column rounded-4" style={{ height: "600px" }}>
          <div className="p-3 pb-0">
            <h5 className="fw-semibold text-center py-2 fs-3">Sổ tay liên lạc</h5>
            <div className="d-flex flex-row gap-2">
              <div className="input-group mb-1">
                <input
                  type="text"
                  className="form-control bg-secondary-subtle rounded-pill"
                  placeholder="Tìm kiếm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div
                className="d-flex flex-row-reverse justify-content-center align-items-center mb-1 fw-medium pointer"
                style={{ fontSize: "14px" }}
                onClick={handleAddNew}
              >
                <BsPlus className="fw-bold fs-5" /> Thêm
              </div>
            </div>
            <div className="d-flex mb-1">
              <div
                className="pointer p-1"
                style={{
                  ...(filter === "thongthuong" ? { color: "#5500ff", fontWeight: 600 } : { color: "#000" }),
                  fontSize: "14px",
                }}
                onClick={() => {
                  setFilter("thongthuong");
                  setSelectedGroup(null);
                  setNameGroup("Nhóm");
                  setShowGroupDropdown(false);
                }}
              >
                Thông thường
              </div>
              <div
                className="pointer p-1"
                style={{
                  ...(filter === "yeuthich" ? { color: "#5500ff", fontWeight: 600 } : { color: "#000" }),
                  fontSize: "14px",
                }}
                onClick={() => {
                  setFilter("yeuthich");
                  setSelectedGroup(null);
                  setNameGroup("Nhóm");
                  setShowGroupDropdown(false);
                }}
              >
                Yêu thích
              </div>
              <div
                className="ms-auto pointer p-1"
                style={{ ...(filter === "nhom" ? { color: "#5500ff" } : { color: "#000" }), fontSize: "14px" }}
                onClick={() => setShowGroupDropdown(!showGroupDropdown)}
              >
                {nameGroup} <FaCaretDown className="ms-1" />
              </div>
            </div>
            {/* {showGroupDropdown && (
              <div
                className="dropdown-menu d-block position-absolute mb-3 border border-0 bg-secondary-subtle rounded-4 p-1 shadow-lg"
                style={{ top: "150px", left: "300px" }}
              >
                {groups.map((group) => (
                  <div
                    key={group}
                    className="dropdown-item d-flex align-items-center pointer rounded-4 gap-1"
                    onClick={() => {
                      setFilter("nhom");
                      setSelectedGroup(group);
                      setNameGroup(group);
                      setShowGroupDropdown(false);
                    }}
                  >
                    <PiTagSimpleFill style={{ color: groupColors[group] }} />
                    {group}
                  </div>
                ))}
              </div>
            )} */}
            {showGroupDropdown && (
              <div
                className="dropdown-menu d-block position-absolute mb-3 border border-0 bg-secondary-subtle rounded-4 p-1 shadow-lg"
                style={{ top: "150px", left: "300px" }}
              >
                {groups.map((group) => (
                  <div
                    key={group}
                    className="dropdown-item d-flex align-items-center justify-content-between pointer rounded-4 gap-1 mb-1"
                    style={{ backgroundColor: "#f8f9fa" }}
                  >
                    <div
                      className="d-flex align-items-center gap-1"
                      onClick={() => {
                        setFilter("nhom");
                        setSelectedGroup(group);
                        setNameGroup(group);
                        setShowGroupDropdown(false);
                      }}
                    >
                      <PiTagSimpleFill style={{ color: groupColorsState[group] || "#000000" }} />
                      {group}
                    </div>

                    {/* Nút hành động */}
                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-sm btn-outline-primary rounded-pill"
                        onClick={async (e) => {
                          e.stopPropagation(); // tránh chọn nhóm
                          const newName = prompt("Nhập tên nhóm mới:", group);
                          if (!newName) return;
                          const newColor = prompt("Nhập mã màu cho nhóm (vd: #FF0000) hoặc để trống:", groupColorsState[group]);
                          try {
                            await API.put(`/groups/${groupIdMap[group]}`, {
                              name: newName,
                              color: newColor || "#000000"
                            });
                            // Cập nhật frontend
                            setGroups(groups.map(g => g === group ? newName : g));
                            setGroupColorsState({ ...groupColorsState, [newName]: newColor || "#000000" });
                            if (selectedGroup === group) setSelectedGroup(newName);
                            toast.success("Cập nhật nhóm thành công!");
                          } catch (err) {
                            console.error(err);
                            toast.error("Lỗi khi cập nhật nhóm!");
                          }
                        }}
                      >
                        Đổi tên
                      </button>

                      <button
                        className="btn btn-sm btn-outline-danger rounded-pill"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!window.confirm(`Bạn có chắc muốn xóa nhóm "${group}" không?`)) return;
                          try {
                            await API.delete(`/groups/${groupIdMap[group]}`);
                            setGroups(groups.filter(g => g !== group));
                            const updatedColors = { ...groupColorsState };
                            delete updatedColors[group];
                            setGroupColorsState(updatedColors);
                            if (selectedGroup === group) setSelectedGroup(null);
                            toast.success("Xóa nhóm thành công!");
                          } catch (err) {
                            console.error(err);
                            toast.error("Lỗi khi xóa nhóm!");
                          }
                        }}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}

                {/* Thêm nhóm mới */}
                <div
                  className="dropdown-item d-flex align-items-center pointer gap-1 rounded-4 text-primary fw-bold"
                  onClick={() => {
                    const name = prompt("Nhập tên nhóm mới:");
                    if (!name) return;
                    const color = prompt("Nhập mã màu cho nhóm (vd: #FF0000) hoặc để trống:");

                    const addGroupAsync = async () => {
                      try {
                        const res = await API.post("/groups", { user_id: 1, name, color });
                        setGroups(prev => Array.from(new Set([...prev, name])));
                        setGroupColorsState({ ...groupColorsState, [name]: color || "#000000" });
                        setGroupIdMap({ ...groupIdMap, [name]: res.data.id });
                        setSelectedGroup(name);
                        setFilter("nhom");
                        setNameGroup(name);
                        setShowGroupDropdown(false);
                        toast.success("Đã thêm nhóm!");
                      } catch (err) {
                        console.error(err);
                        toast.error("Lỗi khi tạo nhóm mới!");
                      }
                    };

                    addGroupAsync();
                  }}
                >
                  Thêm nhóm
                </div>
              </div>
            )}

          </div>
          <div className="flex-grow-1 overflow-auto px-3" style={{ maxHeight: "calc(100vh - 200px)" }}>
            {Object.keys(groupedContacts)
              .sort()
              .map((letter) => (
                <div key={letter}>
                  <div className="p-2 text-dark fw-bold">{letter}</div>
                  <ul className="list-group list-group-flush gap-2">
                    {/* {groupedContacts[letter].map((c) => (
                      <li
                        key={c.id}
                        className={`list-group-item list-group-item-action bg-dark bg-gradient bg-opacity-25 fw-medium rounded-pill d-flex align-items-center p-0 px-3${
                          selectedContact?.id === c.id ? "" : ""
                        }`}
                        onClick={() => handleSelectContact(c)}
                        style={{ cursor: "pointer" }}
                      >
                        <img
                          src={c.link_img}
                          className="rounded-circle me-2"
                          alt="avatar"
                          width="30"
                          height="30"
                        />
                        <div className="d-flex flex-column" style={{ fontSize: "14px" }}>
                          <div className="fw-semibold">{c.name}</div>
                          <div>
                            {c.groups_lh.length === 0 ? (
                              <div className="d-flex">{c.phone}</div>
                            ) : (
                              <div className="d-flex flex-row gap-2">
                                <PiTagSimpleFill style={{ color: groupColorsState[c.groups_lh[0]], fontSize: "18px" }} />
                                <div>{c.phone}</div>
                              </div>
                            )}
                          </div>
                        </div>
                        {c.favourite && <FaStar className="ms-auto fs-5" style={{color: "#f1f111ff"}}/>}
                      </li>
                    ))} */}
                    {groupedContacts[letter].map((c) => (
                      <li
                        key={c.id}
                        className={`list-group-item list-group-item-action bg-dark bg-gradient bg-opacity-25 fw-medium rounded-pill d-flex align-items-center p-0 px-3`}
                        onClick={() => handleSelectContact(c)}
                        style={{ cursor: "pointer" }}
                      >
                        <img
                          src={c.link_img}
                          className="rounded-circle me-2"
                          alt="avatar"
                          width="30"
                          height="30"
                        />
                        <div className="d-flex flex-column" style={{ fontSize: "14px" }}>
                          <div className="fw-semibold">{c.name}</div>
                          <div className="d-flex flex-row align-items-center gap-2">
                            {(() => {
                              const groupName = c.groups_lh.length > 0 ? c.groups_lh[0] : "Người lạ";
                              const color = c.groups_lh.length > 0 ? groupColorsState[groupName] : "#808080";
                              return (
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 256 256"
                                  fill={color}
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M246.66,123.56,201,55.13A15.94,15.94,0,0,0,187.72,48H40A16,16,0,0,0,24,64V192a16,16,0,0,0,16,16H187.72A16,16,0,0,0,201,200.88h0l45.63-68.44A8,8,0,0,0,246.66,123.56Z"></path>
                                </svg>
                              );
                            })()}
                            <div>{c.groups_lh.length > 0 ? c.groups_lh[0] : "Người lạ"}</div>
                          </div>
                        </div>
                        {c.favourite && <FaStar className="ms-auto fs-5" style={{ color: "#f1f111ff" }} />}
                      </li>
                    ))}

                  </ul>
                </div>
              ))}
            {loading && <li className="list-group-item">Đang tải...</li>}
            {!loading && Object.keys(groupedContacts).length === 0 && (
              <li className="list-group-item text-muted">Không tìm thấy liên hệ nào.</li>
            )}
          </div>
        </div>
        <div className="w-100 p-2">
          <div className="text-dark shadow text-center p-2 rounded-pill mt-2 bgLout fw-medium pointer" onClick={() => setUser(null)}>
            Đăng xuất
          </div>
        </div>
      </div>
      <div className="w-75 d-flex flex-column">
        <div className="flex-grow-1">
          {isAddingNew || editingContact ? (
            <ContactForm
              onSuccess={onSuccess}
              editingContact={editingContact}
              setEditingContact={setEditingContact}
              isAddingNew={isAddingNew}
              setIsAddingNew={setIsAddingNew}
            />
          ) : selectedContact ? (
            <div className="card card-body shadow-sm rounded-4 border border-0">
              <div className="d-flex align-items-center mb-3">
                <div
                  className="cardAvatar pointer rounded p-2 position-relative"
                  onClick={() => {
                    handleUploadAvatar
                    setShowAvatarModal(true);
                    setModalAvatarPreview(selectedContact.link_img);
                    setModalAvatarFile(null);
                  }}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onPaste={handlePaste}
                >
                  <img
                    src={selectedContact.link_img}
                    className="rounded-circle me-2"
                    alt="avatar"
                    width="50"
                    height="50"
                  />
                  <div className="iconChangeAvatar">
                    <LuImageUp />
                  </div>
                </div>
                <h5 className="fw-bold mb-0">{selectedContact.name}</h5>
                <FaCaretDown
                  className="ms-2 pointer"
                  onClick={() => setShowContactGroupDropdown(!showContactGroupDropdown)}
                />
              </div>
              {showContactGroupDropdown && (
                <div
                  className="dropdown-menu d-block position-absolute mb-3 border border-0 bg-secondary-subtle rounded-4 shadow-sm p-1"
                  style={{ top: "55px", left: "245px" }}
                >
                  {/* {groups.map((group) => (
                    <div
                      key={group}
                      className="dropdown-item d-flex align-items-center pointer gap-1 rounded-4"
                      onClick={() => handleToggleGroup(selectedContact, group)}
                    >
                      <PiTagSimpleFill style={{ color: groupColors[group] }} />
                      {group}
                      {selectedContact.groups_lh.includes(group) && <span className="ms-auto">✓</span>}
                    </div>
                  ))} */}
                  {groups.map((group) => (
                    <div
                      key={group}
                      className="dropdown-item d-flex align-items-center pointer gap-1 rounded-4"
                      onClick={() => handleToggleGroup(selectedContact, group)}
                    >
                      <PiTagSimpleFill style={{ color: groupColorsState[group] }} />
                      {group}
                      {selectedContact.groups_lh.includes(group) && <span className="ms-auto">✓</span>}
                    </div>
                  ))}

                  <div
                    className="dropdown-item d-flex align-items-center pointer gap-1 rounded-4 text-danger"
                    onClick={handleRemoveAvatar}
                  >
                    <FaRegTrashAlt /> Xóa ảnh
                  </div>
                </div>
              )}
              <h5 className="fw-medium fs-3 m-auto mb-5 border border-0">Thông tin</h5>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-medium">Tên*</label>
                  <input
                    placeholder="Điền thông tin tại đây"
                    className="form-control rounded-pill border border-dark inputA"
                    value={selectedContact.name}
                    readOnly
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium">Ngày sinh</label>
                  <input
                    placeholder="Điền thông tin tại đây"
                    className="form-control rounded-pill border border-dark inputA"
                    value={selectedContact.birthday ? selectedContact.birthday : ""}
                    readOnly
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium">SĐT di động</label>
                  <input
                    placeholder="Điền thông tin tại đây"
                    className="form-control rounded-pill border border-dark inputA"
                    value={selectedContact.phone}
                    readOnly
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium">Email</label>
                  <input
                    placeholder="Điền thông tin tại đây"
                    className="form-control rounded-pill border border-dark inputA"
                    value={selectedContact.email}
                    readOnly
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium">Địa chỉ</label>
                  <input
                    placeholder="Điền thông tin tại đây"
                    className="form-control rounded-pill border border-dark inputA"
                    value={selectedContact.address ? selectedContact.address : ""}
                    readOnly
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium">Quốc tịch</label>
                  <input
                    placeholder="Điền thông tin tại đây"
                    className="form-control rounded-pill border border-dark inputA"
                    value={selectedContact.nationality ? selectedContact.nationality : ""}
                    readOnly
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium">Dân tộc</label>
                  <input
                    placeholder="Điền thông tin tại đây"
                    className="form-control rounded-pill border border-dark inputA"
                    value={selectedContact.ethnicity ? selectedContact.ethnicity : ""}
                    readOnly
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium">Công việc</label>
                  <input
                    placeholder="Điền thông tin tại đây"
                    className="form-control rounded-pill border border-dark inputA"
                    value={selectedContact.job ? selectedContact.job : ""}
                    readOnly
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium">Giới tính</label>
                  <input
                    placeholder="Điền thông tin tại đây"
                    className="form-control rounded-pill border border-dark inputA"
                    value={selectedContact.gender ? selectedContact.gender : ""}
                    readOnly
                  />
                </div>
              </div>
              <div className="mt-3" >
                <label className="form-label fw-medium">Ghi chú thêm</label>
                <textarea
                  placeholder="Điền thông tin tại đây"
                  className="form-control rounded-4 border border-dark inputA"
                  value={selectedContact.note}
                  readOnly
                  rows={3}
                  style={{height: "150px"}}
                />
              </div>
              <div className="mt-3 d-flex justify-content-center gap-4">
                <button
                  className={`btn ${selectedContact.favourite ? "btn-warning" : "btn-outline-warning"} rounded-pill px-3`}
                  onClick={() => handleToggleFavourite(selectedContact)}
                >
                  <FaStar className="me-2" /> {selectedContact.favourite ? "Bỏ yêu thích" : "Yêu thích"}
                </button>
                <button
                  className="btn btn-dark rounded-pill px-3"
                  onClick={() => handleEdit(selectedContact)}
                >
                  <FaRegEdit className="me-2" /> Sửa thông tin
                </button>
                <button
                  className="btn btn-danger rounded-pill px-3"
                  onClick={() => handleDelete(selectedContact.id)}
                >
                  <FaRegTrashAlt className="me-2" /> Xóa bỏ khỏi danh sách
                </button>
              </div>
            </div>
          ) : (
            <div className="d-flex flex-column justify-content-center align-items-center bg-white h-100 rounded-4 shadow">
              <div className="fs-3 fw-semibold">
                Chào mừng bạn quay lại với sổ tay liên lạc
              </div>
              <div className="">
                <img className="" src="/img/imgFirst.png" alt="" width={777} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal để upload avatar */}
      {showAvatarModal && (
        <div className="modal" tabIndex="-1" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Cập nhật ảnh đại diện</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowAvatarModal(false);
                    setModalAvatarFile(null);
                    setModalAvatarPreview(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div
                  className="mb-3 d-flex align-items-center border border-dashed border-2 rounded p-2"
                  onDrop={handleModalDrop}
                  onDragOver={handleModalDragOver}
                  onPaste={handleModalPaste}
                  style={{ cursor: "pointer", backgroundColor: "#f8f9fa", minHeight: "200px", justifyContent: "center" }}
                >
                  {modalAvatarPreview ? (
                    <img
                      src={modalAvatarPreview}
                      className="rounded-circle"
                      alt="avatar preview"
                      style={{ width: "180px", height: "170px" }}
                    />
                  ) : (
                    <span>Kéo thả hoặc nhấp để chọn ảnh</span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleModalAvatarChange}
                  id="modalAvatarInput"
                />
                <button
                  className="btn btn-primary mt-2"
                  onClick={() => document.getElementById("modalAvatarInput").click()}
                >
                  Chọn file
                </button>
                {modalAvatarFile && (
                  <button
                    className="btn btn-danger mt-2 ms-2"
                    onClick={handleModalRemoveAvatar}
                  >
                    <CiCircleRemove /> Xóa
                  </button>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAvatarModal(false);
                    setModalAvatarFile(null);
                    setModalAvatarPreview(null);
                  }}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleModalUpload}
                  disabled={!modalAvatarFile}
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}