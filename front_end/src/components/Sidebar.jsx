import React from 'react';
import { BsPlus } from "react-icons/bs";
import { FaCaretDown, FaStar } from "react-icons/fa";
import { PiTagSimpleFill } from "react-icons/pi";

const BACKEND_URL = "http://localhost:4000";

const Sidebar = ({ 
    user, 
    logout, 
    viewMode, 
    setViewMode, 
    search, 
    setSearch, 
    setIsAddingNew, 
    setSelectedContact, 
    setEditingContact,
    filter, 
    setFilter, 
    nameGroup, 
    setNameGroup, 
    setSelectedGroup, 
    groups, 
    showGroupDropdown, 
    setShowGroupDropdown, 
    groupedContacts, 
    selectedContact 
}) => {

  const groupColors = { "Bạn bè": "#00FFFF", "Người thân": "#FF0000", "Gia đình": "#FF69B4", "Khách hàng": "#00FF00", Sếp: "#0000FF", "Đồng nghiệp": "#FF8C00" };

  return (
    <div className="d-flex flex-column h-100">
        <div className="w-100 bg-white pb-3 d-flex flex-column rounded-4" style={{ height: "600px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <div className="p-3 pb-0">
            
            {/* --- 1. HEADER USER (Bấm vào để xem Profile) --- */}
            <div 
                className="d-flex align-items-center mb-3 p-2 rounded-4"
                style={{cursor: 'pointer', background: viewMode === 'profile' ? '#e6f0ff' : 'transparent', transition: '0.2s'}}
                onClick={() => {
                    setViewMode("profile"); 
                    setSelectedContact(null);
                    setIsAddingNew(false);
                    setEditingContact(null);
                }}
            >
                <img 
                    src={user?.avatar ? `${BACKEND_URL}${user.avatar}` : "/img/avatarDefault.png"}
                    alt="Me" 
                    className="rounded-circle border me-2"
                    width="45" height="45"
                    style={{objectFit: 'cover'}}
                />
                <div>
                    <h5 className="fw-bold mb-0 m-0" style={{fontSize: 16}}>Sổ tay liên lạc</h5>
                    <small className="text-muted">Chào, {user?.username}</small>
                </div>
            </div>

            {/* --- 2. THANH TÌM KIẾM & NÚT THÊM --- */}
            <div className="d-flex flex-row gap-2">
              <input 
                type="text" 
                className="form-control bg-secondary-subtle rounded-pill" 
                placeholder="Tìm kiếm..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
              <div 
                className="d-flex flex-row-reverse align-items-center pointer text-nowrap" 
                style={{cursor: 'pointer', fontWeight: 500}}
                onClick={() => { setIsAddingNew(true); setViewMode("contacts"); setSelectedContact(null); }}
              >
                <BsPlus className="fw-bold fs-5" /> Thêm
              </div>
            </div>
            
            {/* --- 3. BỘ LỌC (Thông thường / Yêu thích / Nhóm) --- */}
            <div className="d-flex mb-1 mt-2" style={{fontSize: 14}}>
                <div className="pointer p-1" style={{cursor:'pointer', fontWeight: filter==="thongthuong"?600:400, color: filter==="thongthuong"?"#007bff":"#000"}} onClick={()=>setFilter("thongthuong")}>Thông thường</div>
                <div className="pointer p-1" style={{cursor:'pointer', fontWeight: filter==="yeuthich"?600:400, color: filter==="yeuthich"?"#007bff":"#000"}} onClick={()=>setFilter("yeuthich")}>Yêu thích</div>
                <div className="ms-auto pointer p-1" style={{cursor:'pointer', color: filter==="nhom"?"#007bff":"#000"}} onClick={()=>setShowGroupDropdown(!showGroupDropdown)}>
                    {nameGroup} <FaCaretDown/>
                </div>
            </div>

            {/* Dropdown chọn nhóm */}
            {showGroupDropdown && (
                <div className="dropdown-menu d-block position-absolute bg-white shadow rounded-4 p-2" style={{zIndex:1000, marginTop: -10}}>
                    {groups.map(g => (
                        <div key={g} className="dropdown-item rounded-3 pointer" onClick={()=>{setFilter("nhom"); setSelectedGroup(g); setNameGroup(g); setShowGroupDropdown(false)}}>
                            <PiTagSimpleFill style={{ color: groupColors[g], marginRight: 5 }} /> {g}
                        </div>
                    ))}
                </div>
            )}
          </div>

          {/* --- 4. DANH SÁCH LIÊN HỆ (Có cuộn dọc) --- */}
          <div className="flex-grow-1 overflow-auto px-3 custom-scrollbar">
             {Object.keys(groupedContacts).length === 0 ? (
                 <div className="text-center text-muted mt-5">Không tìm thấy liên hệ</div>
             ) : (
                 Object.keys(groupedContacts).map(letter => (
                     <div key={letter}>
                         <div className="fw-bold p-2 text-secondary">{letter}</div>
                         {groupedContacts[letter].map(c => (
                             <div key={c.id} 
                                  className={`d-flex align-items-center p-2 mb-1 rounded-pill pointer contact-item ${selectedContact?.id===c.id ? 'active-contact' : ''}`}
                                  style={{cursor: 'pointer', transition: 'background 0.2s'}}
                                  onClick={() => {
                                      setSelectedContact(c); 
                                      setViewMode("contacts");
                                      setIsAddingNew(false);
                                      setEditingContact(null);
                                  }}>
                                 <img src={c.link_img} width="35" height="35" className="rounded-circle me-2 object-fit-cover" alt=""/>
                                 <div style={{fontSize:14, overflow:'hidden'}}>
                                     <div className="fw-bold text-truncate">{c.name}</div>
                                     <div className="text-muted small">{c.phone}</div>
                                 </div>
                                 {c.favourite && <FaStar className="ms-auto text-warning"/>}
                             </div>
                         ))}
                     </div>
                 ))
             )}
          </div>
        </div>
        
        {/* --- 5. NÚT ĐĂNG XUẤT --- */}
        <div className="w-100 p-2 text-center mt-2 bgLout text-white rounded-pill pointer fw-bold shadow-sm" style={{cursor: 'pointer'}} onClick={logout}>
            Đăng xuất
        </div>
    </div>
  );
};

export default Sidebar;