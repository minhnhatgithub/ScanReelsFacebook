# ⚡ ScanReels - Công cụ Quét & Tải Hàng Loạt Video Reels Facebook từ Profile & Fanpage

<img width="1911" height="966" alt="image" src="https://github.com/user-attachments/assets/018969ab-609d-4329-8be7-ed800a533cb4" />
🔗 **Trải nghiệm trực tuyến tại:** [minhnhatgithub.github.io/ScanReelsFacebook](https://minhnhatgithub.github.io/ScanReelsFacebook)

[![Tech Stack](https://img.shields.io/badge/Tech%20Stack-HTML%20%7C%20CSS%20%7C%20JS-blue)](https://github.com)
[![Platform](https://img.shields.io/badge/Platform-Cloudflare%20Workers%20%7C%20Browser-orange)](https://github.com)
[![License](https://img.shields.io/badge/License-MIT-green)](https://github.com)
[![Free](https://img.shields.io/badge/Free-100%25-brightgreen)](https://github.com)

**ScanReels** là công cụ trực tuyến tối giản nhưng cực kỳ mạnh mẽ, giúp bạn quét toàn bộ danh sách video Reels từ bất kỳ **Trang cá nhân (Profile) hoặc Fanpage công khai** nào trên Facebook. Không cần đăng nhập, bảo mật tuyệt đối, và hoàn toàn miễn phí!

Công cụ được tối ưu hóa giao diện đẹp mắt, hiệu ứng mượt mà và tích hợp các tính năng phục vụ hoàn hảo cho cả nhu cầu cá nhân lẫn các nhà làm nội dung (Reup, Affiliate), các nhà phát triển công cụ tự động hóa.

---

## ✨ Các tính năng nổi bật

### 1. Quét danh sách Reels cực nhanh bằng UID/URL
- Hỗ trợ nhập trực tiếp đường dẫn Trang cá nhân, Fanpage hoặc mã UID của người dùng Facebook.
- Tự động nhận diện và chuyển đổi URL Facebook thành UID hợp lệ.
- Tốc độ quét tối ưu qua API Server được xây dựng trên Cloudflare Workers.

### 2. Tải hàng loạt Video chất lượng gốc (HD/SD)
- Tải trực tiếp video dưới định dạng `.mp4` nguyên bản từ máy chủ CDN của Facebook.
- **Trình quản lý tiến trình tải thông minh:**
  - Hiển thị phần trăm tải thực tế, tốc độ tải thời gian thực (KB/s, MB/s).
  - Hỗ trợ **Tạm dừng (Pause)**, **Tiếp tục (Resume)** và **Hủy tải (Cancel)** trực tiếp qua các thông báo Toast.
  - Tự động chuyển hướng mở Tab mới (CORS fallback) nếu trình duyệt chặn tải trực tiếp.

### 3. Bộ lọc và Sắp xếp nâng cao
- Tìm kiếm nhanh video Reels dựa theo nội dung mô tả (caption/text).
- Sắp xếp linh hoạt theo các tiêu chí:
  - Mới nhất (Mặc định).
  - Lượt xem: Từ cao đến thấp hoặc thấp đến cao.
  - Thời lượng: Dài đến ngắn hoặc ngắn đến dài.

### 4. Menu chuột phải (Context Menu) & Tùy biến sao chép dữ liệu
- **Click chuột phải trên dòng kết quả** để mở menu phím tắt thông minh:
  - Sao chép nhanh UID.
  - Sao chép Caption/Mô tả.
  - Sao chép liên kết tải xuống (HD & SD).
  - Sao chép toàn bộ thông tin dòng hiện tại.
- **Hỗ trợ định dạng đầu ra tùy biến (Custom Copy Format):**
  - Cho phép người dùng chọn hoặc tự định nghĩa mẫu định dạng copy (Ví dụ: `{uid}|{caption}` hoặc `{uid}|{caption}|{hd_url}`).
  - Hỗ trợ **Sao chép List theo định dạng** (toàn bộ video hiển thị trên bảng sẽ được copy thành danh sách, mỗi video một dòng), cực kỳ tiện lợi để import trực tiếp vào các công cụ chạy tự động (như MinoFacebook, Spam Reels, v.v.).

### 5. Thiết kế hiện đại & Tương thích mọi thiết bị
- Giao diện Premium được thiết kế tỉ mỉ với hiệu ứng Glassmorphism (kính mờ), chuyển màu hài hòa và micro-animations mượt mà.
- Hỗ trợ **Chế độ sáng/tối (Light/Dark Mode)** tự động đồng bộ theo hệ thống hoặc chuyển đổi linh hoạt.
- Thiết kế Responsive 100%, hiển thị sắc nét trên cả máy tính (PC) lẫn điện thoại di động.

---

## 🛠️ Công nghệ sử dụng

- **Front-end:** HTML5 (Cấu trúc ngữ nghĩa SEO), Vanilla CSS (Tùy biến giao diện hiện đại), JavaScript thuần (ES6+).
- **Back-end:** Cloudflare Workers (API trung gian phân tích dữ liệu Graph Facebook bảo mật và không bị giới hạn băng thông).
- **Icons & Effects:** SVG vector chất lượng cao, hiệu ứng chuyển động CSS keyframes.

---


## 📖 Hướng dẫn sử dụng

1. **Bước 1:** Lên Facebook, copy liên kết của Trang cá nhân/Fanpage công khai cần quét video (hoặc copy UID của họ).
2. **Bước 2:** Vào trang công cụ, nhấn nút **Dán** để điền nhanh URL từ Clipboard.
3. **Bước 3:** Lựa chọn số lượng Reels muốn quét (10, 30, 50 hoặc chọn **Tùy chỉnh** để nhập số lượng lớn hơn lên tới vài trăm Reels).
4. **Bước 4:** Nhấn **Quét video** và chờ vài giây.
5. **Bước 5:** 
   - Sử dụng thanh **Tìm kiếm** hoặc **Sắp xếp** để lọc ra những video muốn reup hoặc lấy thông tin.
   - Nhấn **HD** hoặc **SD** để tải nhanh video về thiết bị.
   - Chọn định dạng copy ở bộ lọc, sau đó **nhấp chuột phải** vào video bất kỳ để lấy nhanh UID hoặc toàn bộ danh sách kết quả đã định dạng để đưa vào các công cụ tự động hóa khác.

---

## ⚠️ Tuyên bố miễn trừ trách nhiệm

Công cụ này được phát triển dựa trên mục đích học tập, nghiên cứu và hỗ trợ cộng đồng làm Marketing Online chính đáng. Tác giả hoàn toàn không chịu trách nhiệm đối với bất kỳ hành vi sử dụng công cụ vào mục đích xấu, vi phạm chính sách của Facebook hay vi phạm pháp luật của nước sở tại. Hãy tôn trọng bản quyền nội dung của các nhà sáng tạo video trên Facebook.

---

## 📞 Liên hệ hỗ trợ

Nếu bạn gặp khó khăn trong quá trình sử dụng hoặc cần phát triển thêm tính năng khác, hãy liên hệ:
- **Facebook cá nhân:** [Facebook/khumnumm](https://www.facebook.com/khumnumm)
- **Tác giả:** Minh Nhật
*Chúc các bạn quét và quản lý Reels thật hiệu quả! ⭐ Đừng quên đánh dấu sao (Star) nếu bạn thấy công cụ này hữu ích nhé!*
