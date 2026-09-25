# Checklist hoàn tất SEO ảnh

Đánh dấu từng mục áp dụng: đạt, không đạt, chưa kiểm tra hoặc không áp dụng. Hướng dẫn hay phản hồi REST media không thay thế kiểm tra giao diện thật.

## Trước upload

- Xem ảnh nguồn, đọc chữ quan trọng. Làm rõ OCR còn mơ hồ có ảnh hưởng, không bịa dữ liệu.
- Khớp ngữ cảnh bài; phân biệt ảnh chụp, phối cảnh, mặt bằng và sơ đồ.
- Tên file ASCII mô tả đúng, phân tách bằng gạch nối, không nhồi từ khóa.
- Ưu tiên WebP nếu WordPress/server hỗ trợ; tạo byte WebP thật, không đổi tên PNG.
- Kích thước theo vị trí hiển thị, mật độ pixel và nguồn. Không phóng lớn. Giữ chi tiết mặt bằng/tài liệu, có bản chi tiết khi chữ trên mobile khó đọc.
- So nhiều bản, chọn nhỏ nhất đủ rõ; không áp chất lượng hay mức KB chung. Giữ hướng, tỷ lệ, độ trong suốt và màu; không sửa nguồn.
- Xem bản chọn ở 100% và kích thước dự kiến, nhất là nhãn nhỏ, số, nét mảnh. Ghi định dạng, kích thước và mức giảm byte. Chỉ số tương đồng tự động chỉ là bộ lọc.

## Metadata

- Tiêu đề ngắn, mô tả đúng.
- Alt diễn đạt tự nhiên nội dung có ý nghĩa trong ngữ cảnh; ảnh thông tin cần alt hữu ích, ảnh trang trí có thể để rỗng.
- Caption bổ sung ngữ cảnh hoặc ghi rõ phối cảnh.
- Mô tả chứa chi tiết thực tế, nguồn hoặc lưu ý cần thiết; không phải meta description bài.

## Tích hợp WordPress

- Gắn đúng attachment đại diện khi được yêu cầu, vị trí inline đúng và không chèn trùng.
- Alt inline đúng cả khi media alt đã đổi sau đó; sửa alt trong thư viện không nhất thiết cập nhật HTML bài cũ.
- Kích thước/tỷ lệ nội tại giữ chỗ tránh xê dịch. srcset/sizes khi được theme hỗ trợ chọn biến thể phù hợp.
- Đọc lại bốn trường và liên kết bài đã yêu cầu; giữ trạng thái xuất bản.

## Trang hiển thị thực tế (khi áp dụng)

- URL ảnh công khai tải được, đúng loại và file; kiểm tra biến thể/CDN thực tế khi liên quan.
- Mobile đọc được, không méo hoặc tràn.
- Ảnh đầu trang/LCP không lazy-load; chỉ ảnh thực sự quan trọng mới cần fetch priority cao. Ảnh dưới vùng đầu có thể lazy-load. Kiểm tra HTML vì WordPress/theme/plugin có thể thay thuộc tính.
- Báo lỗi theme/server, không âm thầm sửa toàn cục. Bản nháp không có preview xác thực thì ghi chưa kiểm tra; không đăng công khai để test.

Nguồn: [Google SEO ảnh](https://developers.google.com/search/docs/appearance/google-images), [tối ưu LCP](https://web.dev/articles/optimize-lcp).
