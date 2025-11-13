CREATE DATABASE IF NOT EXISTS contact_Book;
USE contact_Book;

-- Tạo bảng user
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng contacts
CREATE TABLE contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    email VARCHAR(100),
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- INSERT dữ liệu mẫu
INSERT INTO contacts (user_id, ho_ten, so_dien_thoai, email, note, created_at) VALUES
(1, 'Phạm Anh Dũng', '0905123789', 'dungpham123@gmail.com', 'Ae Cầu Giấy', '2025-01-12 09:15:42'),
(1, 'Nguyễn Minh Hải', '0987421653', 'minhhai567@gmail.com', 'Ae Đống Đa', '2025-02-03 14:22:10'),
(1, 'Trần Quốc Huy', '0978654312', 'huytran99@gmail.com', 'Ae Bến Nghé', '2025-02-17 18:47:22'),
(1, 'Lê Nhật Hào', '0912348756', 'haole123@gmail.com', 'Ae Cầu Tre', '2025-03-05 10:31:55'),
(1, 'Nguyễn Văn Tâm', '0945321786', 'tamnguyen321@gmail.com', 'Ae An Cư', '2025-03-18 11:42:20'),
(1, 'Đặng Gia Khánh', '0978412563', 'khanhdg77@gmail.com', 'Ae Hòa Thuận', '2025-03-30 09:15:12'),
(1, 'Phan Tấn Lộc', '0934567123', 'locphan2025@gmail.com', 'Ae Bình Minh', '2025-04-02 16:25:50'),
(1, 'Võ Quang Minh', '0965478123', 'vqminh123@gmail.com', 'Ae Phước Long', '2025-04-18 08:42:31'),
(1, 'Nguyễn Thị Lan', '0908345672', 'lannguyen789@gmail.com', 'Ae Mỹ Phước', '2025-05-01 12:35:48'),
(1, 'Hoàng Bảo Nam', '0934758124', 'namhoang456@gmail.com', 'Ae Tân Lộc', '2025-05-10 15:21:05'),
(1, 'Trần Khánh Vy', '0912785634', 'vytran2025@gmail.com', 'Ae Long Hưng', '2025-05-25 10:45:12'),
(1, 'Nguyễn Văn Dương', '0903124789', 'duongnv@gmail.com', 'Ae Thạnh Mỹ', '2025-06-01 17:30:18'),
(1, 'Phạm Hoàng Long', '0981234765', 'longph2025@gmail.com', 'Ae An Bình', '2025-06-11 09:11:09'),
(1, 'Nguyễn Hữu Phú', '0976532184', 'phunh2025@gmail.com', 'Ae Phú Mỹ', '2025-06-23 20:55:41'),
(1, 'Trần Thị Hồng', '0918745236', 'hongtran@gmail.com', 'Ae An Hòa', '2025-07-02 14:17:28'),
(1, 'Lê Văn Dũng', '0948765123', 'dungle2025@gmail.com', 'Ae Phước Tân', '2025-07-13 08:12:37'),
(1, 'Nguyễn Ngọc Mai', '0902456789', 'mainguyen2025@gmail.com', 'Ae Hòa Bình', '2025-07-27 13:40:52'),
(1, 'Phan Minh Tuấn', '0967854321', 'tuanphan2025@gmail.com', 'Ae Hòa Cường', '2025-08-05 09:54:10'),
(1, 'Trịnh Thị Thu', '0934765128', 'thutrinh2025@gmail.com', 'Ae Hòa Thuận', '2025-08-11 10:45:17'),
(1, 'Đỗ Anh Khoa', '0987123459', 'khoa.do2025@gmail.com', 'Ae Tân Châu', '2025-08-25 18:14:49'),
(1, 'Nguyễn Quang Tài', '0912367895', 'tai.nguyen2025@gmail.com', 'Ae Hòa Lợi', '2025-09-02 08:33:21'),
(1, 'Trần Bảo Linh', '0941235876', 'linhtran2025@gmail.com', 'Ae Mỹ Hạnh', '2025-09-09 09:11:37'),
(1, 'Phạm Hữu Nghĩa', '0978436521', 'nghiaph2025@gmail.com', 'Ae Phú An', '2025-09-22 16:45:18'),
(1, 'Nguyễn Tấn Khoa', '0902764531', 'khoant2025@gmail.com', 'Ae Bình Phú', '2025-10-01 19:40:12'),
(1, 'Lê Thị Yến', '0913478569', 'yenle2025@gmail.com', 'Ae An Phú', '2025-10-07 09:51:26'),
(1, 'Vũ Đức Anh', '0978123645', 'anhvu2025@gmail.com', 'Ae Long Xuyên', '2025-10-14 11:12:39'),
(1, 'Nguyễn Thị Nhung', '0932145786', 'nhungnguyen2025@gmail.com', 'Ae Hòa Mỹ', '2025-10-20 13:28:50'),
(1, 'Hoàng Quốc Bảo', '0964532781', 'quocbao2025@gmail.com', 'Ae Tân Thành', '2025-11-02 09:00:00'),
(1, 'Phạm Thị Kim Ngân', '0908654327', 'nganpham2025@gmail.com', 'Ae Cái Răng', '2025-11-15 08:35:42'),
(1, 'Nguyễn Đức Trí', '0976432185', 'trind2025@gmail.com', 'Ae Vĩnh Long', '2025-12-03 20:25:15');
