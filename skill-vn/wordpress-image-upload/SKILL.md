---
name: wordpress-image-upload
description: Đọc ảnh và chữ trong ảnh, tối ưu WebP giữ độ rõ, soạn tiêu đề media, alt, caption, mô tả rồi upload/cập nhật WordPress; gắn ảnh đại diện hoặc trong bài khi được yêu cầu. Dùng cho upload ảnh, SEO ảnh, setup website và chọn credentials theo website; không dành cho tạo ảnh hay thiết kế lại.
---

# Upload ảnh WordPress

Đọc [setup website](references/site-setup.md) và hồ sơ riêng qua [danh mục hồ sơ](references/sites/index.md). Tài nguyên bắt buộc nằm trong skill này, không phụ thuộc thư mục skill khác.

## Xác định phạm vi

Làm rõ file nguồn, website, tạo media hay sửa attachment hiện có, chỉ upload hay gắn đại diện/chèn bài. Xác định đúng bài đích nếu cần. Dùng lựa chọn đã rõ; không gắn vào bài gần nhất tùy ý hoặc dùng ID từ website khác.

## Đọc ảnh và tối ưu bốn trường

Mở từng ảnh bằng công cụ xem ảnh trước khi viết metadata. Đọc chữ trực tiếp (OCR bằng thị giác). Chữ nhỏ cần xem độ phân giải gốc hoặc dùng OCR có sẵn; không bịa số không rõ. Tách bằng chứng trong ảnh khỏi ngữ cảnh người dùng cung cấp. Ghi nhận điều chưa chắc có ảnh hưởng, nhất là tên dự án, mã căn, diện tích, giá và ngày tháng.

- **Tiêu đề:** tên chủ thể ngắn, dễ đọc; thêm mã căn/dự án đã xác nhận khi hữu ích. Tránh tên file chung chung và danh sách từ khóa.
- **Văn bản thay thế (alt):** mô tả nội dung hình có ý nghĩa trong ngữ cảnh bài. Đưa chữ quan trọng vào khi bổ sung ý nghĩa; không chép hết quảng cáo, slogan, số điện thoại. Tránh cụm thừa “hình ảnh của” và nhồi từ khóa. Ảnh trang trí thuần túy có thể alt rỗng, mặt bằng cung cấp thông tin thì không.
- **Caption:** chú thích ngắn giúp độc giả hiểu ảnh. Phân biệt phối cảnh/minh họa với ảnh chụp thật, thêm lưu ý khi cần.
- **Mô tả:** thông tin thực tế chi tiết hơn, chữ quan trọng đọc được, ngữ cảnh hoặc nguồn. Không biến OCR thành bằng chứng cho chi tiết không xuất hiện trong ảnh. Mô tả media không phải meta description của bài.

Dùng ngôn ngữ được yêu cầu và quy ước biên tập của website. Không có hạn mức ký tự SEO cứng cho bốn trường; ưu tiên chính xác, dễ đọc. Không tự gán tên dự án chỉ vì bài có relation đến dự án đó.

## Upload và gắn ảnh

1. Ưu tiên WebP trước upload mới theo [tối ưu WebP](references/webp-optimization.md). Giữ bản gốc, thử nhiều mức nén và xem trực quan bản nhỏ nhất đủ rõ. Dùng giới hạn của website; không ép mặt bằng nhiều chữ vào chiều rộng/dung lượng cố định. Nếu không hỗ trợ WebP, file lớn hơn bản gốc phù hợp hoặc giảm độ rõ, giữ định dạng thích hợp và giải thích. WebP đã tối ưu thường không cần nén lại. Đặt tên file ASCII mô tả đúng nội dung và đúng định dạng thực.
2. Dùng [API helper](references/api-helper.md) POST nhị phân đến `/wp/v2/media`. Lưu ngay attachment ID và URL nguồn. Không upload lại mù quáng nếu bước sau lỗi hoặc mất phản hồi; kiểm tra receipt và media gần đây trước.
3. POST `/wp/v2/media/{id}` với `title`, `alt_text`, `caption`, `description`; chỉ thêm `post` cho bài đích đã xác định. Đọc lại với `context=edit`, đối chiếu `title.raw`, `caption.raw`, `description.raw`, `alt_text`.
4. Nếu được yêu cầu, POST bài với `featured_media: attachment_id`. Gán `post` trên attachment không tự làm nó thành ảnh đại diện.
5. Chèn trong bài: đọc `content.raw` mới nhất, chèn block Gutenberg hợp lệ đúng vị trí. Dùng `wp:image` với `id`, `sizeSlug`, `linkDestination`, figure chứa URL ảnh và alt đã escape. Thêm kích thước width/height đúng để giữ chỗ; caption dùng `figcaption.wp-element-caption`. Tránh chèn trùng và giữ nội dung khác. Sửa bài rộng hơn có thể dùng `wordpress-post-upload`; skill này tự hỗ trợ featured/inline.
6. Đọc lại media và bài. Xác minh ID đại diện/vị trí inline, trạng thái xuất bản không đổi và nội dung cũ được giữ. Nêu rõ nếu vị trí phụ thuộc theme.

Dùng [checklist SEO ảnh](references/seo-checklist.md) khi bàn giao. Trang công khai kiểm tra phân phối ảnh và bố cục mobile nếu có công cụ; phân biệt chưa kiểm tra/phụ thuộc theme với đã đạt. Không tự đổi cấu hình toàn theme/cache/lazy-load chỉ để upload.

Trả link media/chỉnh sửa, bốn trường đã lưu, trạng thái gắn ảnh, định dạng, kích thước và số byte trước/sau. Nêu mục chưa kiểm chứng. Media Library tạo file có URL công khai kể cả bài còn nháp; không gọi upload media là riêng tư. Không cần đổi Rank Math nếu không được yêu cầu.
