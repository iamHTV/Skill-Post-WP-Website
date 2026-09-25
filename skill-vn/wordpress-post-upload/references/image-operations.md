# Xử lý ảnh khi không cài skill ảnh

Mở ảnh và đọc chữ trước khi soạn title, alt_text, caption, description. Chỉ mô tả phần nhìn thấy hoặc ngữ cảnh đã xác nhận; không bịa giá, kích thước, tên dự án. Tên file phải mô tả đúng và có đuôi khớp định dạng thực đã chọn.

Ưu tiên WebP trước upload mới khi website hỗ trợ. Nếu có wordpress-image-upload, dùng quy trình tạo nhiều bản nén và kiểm tra trực quan của skill đó. Nếu không, dùng encoder cục bộ có sẵn để so sánh WebP chất lượng cao/lossless, giữ bản gốc và xem chữ, đường nét, màu, độ trong suốt. Chọn file nhỏ nhất đủ rõ trong các bản đã thử; không ép mức KB, phóng lớn hay nén lại WebP đã tối ưu. Giữ bản gốc phù hợp nếu chuyển đổi lớn hơn hoặc mất chi tiết quan trọng. Ghi byte/kích thước trước sau. Không cần dịch vụ nén bên thứ ba.

Dùng scripts/wp-api.mjs theo [API helper](api-helper.md). POST nhị phân tới /wp/v2/media, lưu ngay ID rồi POST bốn trường tới /wp/v2/media/{id}. Đọc lại title.raw, alt_text, caption.raw, description.raw bằng context=edit. Chỉ gán featured_media cho bài đích khi được yêu cầu.

Chèn ảnh: đọc content.raw mới nhất, giữ nội dung và thêm Gutenberg wp:image đúng vị trí. Dùng source_url đã lưu, kích thước nội tại đúng, alt/caption đã escape. Kiểm tra ID attachment hiện có để tránh trùng. “Dưới tiêu đề” là đầu nội dung bài, không đổi theme. Nếu chỉ cung cấp URL/ID thì đọc media đã có, không upload lại. Trang công khai kiểm tra mobile, ảnh responsive và LCP có bị lazy-load sai không; báo mục chưa thử/phụ thuộc theme thay vì đánh dấu đạt.

Bài nháp không làm URL media riêng tư. Giữ trạng thái xuất bản gốc; không biến đổi hoặc upload thêm ngoài yêu cầu.
